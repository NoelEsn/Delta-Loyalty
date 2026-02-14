import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { recalculateMember } from '@/lib/db';

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

    const purchases = await prisma.purchase.findMany({
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
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

    const { memberId, amount, note, date } = await request.json();

    if (!memberId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create purchase
    const purchase = await prisma.purchase.create({
      data: {
        memberId,
        amount,
        note: note || null,
        date: new Date(date),
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    // Recalculate member metrics
    await recalculateMember(memberId);

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
