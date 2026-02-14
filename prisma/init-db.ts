import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeDatabase() {
  console.log('🔄 Initializing database...')

  try {
    // Test connection
    await prisma.$executeRaw`SELECT 1`
    console.log('✅ Database connection successful')

    // Run migrations
    console.log('📋 Running Prisma migrations...')
    const { execSync } = require('child_process')
    execSync('npx prisma migrate deploy --skip-generate', {
      stdio: 'inherit',
    })
    console.log('✅ Migrations completed')
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

initializeDatabase()
  .then(() => {
    console.log('✅ Database ready!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error)
    process.exit(1)
  })
