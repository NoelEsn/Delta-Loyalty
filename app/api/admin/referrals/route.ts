import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

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

    const referrals = await prisma.referral.findMany({
      include: {
        referrer: {
          include: {
            user: true,
          },
        },
        referredMember: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { referrerId, referredMemberId, date, adminNote } = await request.json();

    // Validation: required fields
    if (!referrerId || !referredMemberId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validation: prevent self-referral
    if (referrerId === referredMemberId) {
      return NextResponse.json(
        { error: 'A member cannot refer themselves' },
        { status: 400 }
      );
    }

    // Validation: both members exist
    const [referrer, referred] = await Promise.all([
      prisma.member.findUnique({ where: { id: referrerId } }),
      prisma.member.findUnique({ where: { id: referredMemberId } }),
    ]);

    if (!referrer || !referred) {
      return NextResponse.json(
        { error: 'One or both members do not exist' },
        { status: 404 }
      );
    }

    // Validation: prevent duplicate
    const existingReferral = await prisma.referral.findUnique({
      where: {
        referrerId_referredMemberId: {
          referrerId,
          referredMemberId,
        },
      },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: 'This referral link already exists' },
        { status: 409 }
      );
    }

    // Create referral
    const referral = await prisma.referral.create({
      data: {
        referrerId,
        referredMemberId,
        date: new Date(date),
        adminNote: adminNote || null,
        status: 'ACTIVE',
      },
      include: {
        referrer: {
          include: {
            user: true,
          },
        },
        referredMember: {
          include: {
            user: true,
          },
        },
      },
    });

    // Recalculate referrer's metrics
    const referrerReferralsCount = await prisma.referral.count({
      where: {
        referrerId,
        status: 'ACTIVE',
      },
    });

    await prisma.member.update({
      where: { id: referrerId },
      data: {
        referralsCount: referrerReferralsCount,
      },
    });

    // Recalculate referrer's ambassador level
    const { recalculateMember } = await import('@/lib/db');
    await recalculateMember(referrerId);

    return NextResponse.json(referral, { status: 201 });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
