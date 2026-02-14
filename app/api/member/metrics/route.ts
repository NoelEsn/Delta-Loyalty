import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { determinePinLevels, calculateTotalPins, isDiamondEligible } from '@/lib/pinEngine';

function getSessionFromCookie(cookieStr: string | null) {
  if (!cookieStr) return null;
  try {
    return JSON.parse(cookieStr);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value ?? null;
    const session = getSessionFromCookie(sessionCookie);

    if (!session || !session.memberId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get member with all data
    const member = await prisma.member.findUnique({
      where: { id: session.memberId },
      include: {
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Calculate levels
    const levels = determinePinLevels({
      totalSpent: member.totalSpent || 0,
      eventsCount: member.eventsCount || 0,
      referralsCount: member.referralsCount || 0,
    });

    const totalPins = calculateTotalPins(levels);
    const isDiamond = isDiamondEligible(levels);

    return NextResponse.json({
      memberNumber: member.memberNumber,
      totalSpent: member.totalSpent,
      eventsCount: member.eventsCount,
      referralsCount: member.referralsCount,
      levels,
      totalPins,
      isDiamondEligible: isDiamond,
      createdAt: member.createdAt,
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
