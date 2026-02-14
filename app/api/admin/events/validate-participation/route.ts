import { NextRequest, NextResponse } from 'next/server'
import { prisma, recalculateMember } from '@/lib/db'
import { cookies } from 'next/headers'

function getSessionFromCookie(cookieStr: string | null) {
  if (!cookieStr) return null
  try {
    return JSON.parse(cookieStr)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value || null
    const session = getSessionFromCookie(sessionCookie)

    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memberId, eventId } = await request.json()

    if (!memberId || !eventId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if participation already exists
    const existingParticipation = await prisma.eventParticipation.findUnique({
      where: {
        memberId_eventId: {
          memberId,
          eventId,
        },
      },
    })

    if (existingParticipation) {
      return NextResponse.json({ error: 'Member already participated in this event' }, { status: 400 })
    }

    // Create participation
    const participation = await prisma.eventParticipation.create({
      data: {
        memberId,
        eventId,
        checkinDate: new Date(),
      },
    })

    // Recalculate member metrics (events count changed)
    await recalculateMember(memberId)

    return NextResponse.json(participation, { status: 201 })
  } catch (error) {
    console.error('Error validating event participation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET participations for a specific event
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value || null
    const session = getSessionFromCookie(sessionCookie)

    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })
    }

    const participations = await prisma.eventParticipation.findMany({
      where: { eventId },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        checkinDate: 'desc',
      },
    })

    return NextResponse.json(participations)
  } catch (error) {
    console.error('Error fetching participations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
