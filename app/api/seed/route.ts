import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Prevent this route from being rendered statically
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Prevent execution during static generation
    if (process.env.NODE_ENV === 'production' && !request.headers.get('user-agent')?.includes('curl')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Seed endpoint is read-only during production builds',
        },
        { status: 503 }
      )
    }

    console.log('🌱 Seeding database...')

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@delta-fraternite.com' },
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: '✓ Admin user already exists',
        data: {
          email: 'admin@delta-fraternite.com',
          memberNumber: existingAdmin.id,
        },
      })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@delta-fraternite.com',
        password_hash: hashedPassword,
        role: 'ADMIN',
      },
    })

    // Generate member number for admin
    const count = await prisma.member.count()
    const year = new Date().getFullYear()
    const memberNumber = `DF-${year}-${String(count + 1).padStart(5, '0')}`

    // Create member profile for admin
    await prisma.member.create({
      data: {
        userId: admin.id,
        memberNumber,
      },
    })

    // Initialize global settings
    await prisma.globalSettings.deleteMany()
    await prisma.globalSettings.create({
      data: {
        hallOfFameActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: '✓ Database seeded successfully!',
      data: {
        email: 'admin@delta-fraternite.com',
        password: 'admin123',
        memberNumber: memberNumber,
      },
    })
  } catch (error) {
    console.error('❌ Seed error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  } finally {
    // Always disconnect to prevent connection pool issues during build
    await prisma.$disconnect()
  }
}
