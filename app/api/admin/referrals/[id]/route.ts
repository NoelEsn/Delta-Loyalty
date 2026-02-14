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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const referralId = params.id;

    // Check if referral exists
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Delete referral
    await prisma.referral.delete({
      where: { id: referralId },
    });

    // Recalculate referrer's referrals count
    const newReferralCount = await prisma.referral.count({
      where: {
        referrerId: referral.referrerId,
        status: 'ACTIVE',
      },
    });

    await prisma.member.update({
      where: { id: referral.referrerId },
      data: {
        referralsCount: newReferralCount,
      },
    });

    // Recalculate levels
    const { recalculateMember } = await import('@/lib/db');
    await recalculateMember(referral.referrerId);

    return NextResponse.json({
      success: true,
      message: 'Referral deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
