import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { isDiamondEligible, determinePinLevels } from '@/lib/pinEngine';

const prisma = new PrismaClient();

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

    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all members
    const members = await prisma.member.findMany({
      include: {
        user: true,
      },
    });

    // Count diamond members
    let diamondCount = 0;
    members.forEach((member) => {
      const levels = determinePinLevels({
        totalSpent: member.totalSpent || 0,
        eventsCount: member.eventsCount || 0,
        referralsCount: member.referralsCount || 0,
      });
      if (isDiamondEligible(levels)) {
        diamondCount++;
      }
    });

    // Get total revenue
    const purchases = await prisma.purchase.findMany();
    const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Get this month's events
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: now,
        },
      },
    });

    return NextResponse.json({
      totalMembers: members.length,
      diamondMembers: diamondCount,
      totalRevenue,
      eventsThisMonth: events.length,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
