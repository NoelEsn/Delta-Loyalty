import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@delta-fraternite.com' },
    })

    if (existingAdmin) {
      console.log('✓ Admin user already exists')
    } else {
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

      // Create member profile for admin (so they can access both dashboards)
      await prisma.member.create({
        data: {
          userId: admin.id,
          memberNumber,
        },
      })

      console.log('✓ Admin user created')
      console.log('  Email: admin@delta-fraternite.com')
      console.log('  Password: admin123')
      console.log('  ⚠️  Change this password in production!')
      console.log('  📌 Admin has member profile: ' + memberNumber)
    }

    // Initialize global settings
    await prisma.globalSettings.deleteMany()
    await prisma.globalSettings.create({
      data: {
        hallOfFameActive: false,
      },
    })

    console.log('✓ Global settings initialized')

    // Seed Pin definitions with badge images
    // Check if pins already exist
    const existingPins = await prisma.pin.count()
    
    if (existingPins === 0) {
      // Client spending pins with badge images
      await prisma.pin.create({
        data: {
          axis: 'spending',
          level: 1,
          label: 'Client Bronze',
          icon: 'workspace_premium',
          metallic: 'bronze',
          imageUrl: '/badges/clients/badge-client-bronze.jpg',
        },
      })

      await prisma.pin.create({
        data: {
          axis: 'spending',
          level: 2,
          label: 'Client Silver',
          icon: 'shopping_bag',
          metallic: 'silver',
          imageUrl: '/badges/clients/badge-client-argent.jpg',
        },
      })

      await prisma.pin.create({
        data: {
          axis: 'spending',
          level: 3,
          label: 'Client Gold',
          icon: 'bolt',
          metallic: 'gold',
          imageUrl: '/badges/clients/badge-client-or.jpg',
        },
      })

      console.log('✓ Pin definitions created with badge images')
      console.log('  - Client Bronze → /badges/clients/badge-client-bronze.jpg')
      console.log('  - Client Silver → /badges/clients/badge-client-argent.jpg')
      console.log('  - Client Gold → /badges/clients/badge-client-or.jpg')
    } else {
      console.log('✓ Pin definitions already exist')
    }

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
