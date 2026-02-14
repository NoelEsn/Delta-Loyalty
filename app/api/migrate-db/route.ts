import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting migration from SQLite to PostgreSQL...\n')

    // Read the SQLite database file
    const dbPath = path.join(process.cwd(), 'prisma', 'delta-fraternite.db')
    
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json(
        {
          success: false,
          error: 'SQLite database not found at ' + dbPath,
        },
        { status: 404 }
      )
    }

    console.log('📖 Reading data from SQLite...')
    
    // Import sqlite3 dynamically to avoid dependency issues
    let Database: any
    try {
      Database = (await import('better-sqlite3')).default
    } catch {
      // Fallback: try to use Prisma to read from SQLite
      return NextResponse.json(
        {
          success: false,
          error: 'better-sqlite3 not installed. Run: npm install better-sqlite3',
        },
        { status: 500 }
      )
    }

    const sqliteDb = new Database(dbPath)

    // Read all data from SQLite
    const users = sqliteDb.prepare('SELECT * FROM users').all() as any[]
    const members = sqliteDb.prepare('SELECT * FROM members').all() as any[]
    const events = sqliteDb.prepare('SELECT * FROM events').all() as any[]
    const purchases = sqliteDb.prepare('SELECT * FROM purchases').all() as any[]
    const referrals = sqliteDb.prepare('SELECT * FROM referrals').all() as any[]

    console.log(`✅ Data read:
  - ${users.length} users
  - ${members.length} members
  - ${events.length} events
  - ${purchases.length} purchases
  - ${referrals.length} referrals\n`)

    // Write to PostgreSQL
    console.log('✍️  Writing to PostgreSQL (Supabase)...\n')

    let migrated = 0
    let usersMigratedCount = 0
    let membersMigratedCount = 0

    // Migrate users FIRST
    console.log('👥 Migrating users...')
    for (const user of users) {
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            password_hash: user.password_hash,
            role: user.role,
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
          },
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
            password_hash: user.password_hash,
            role: user.role,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
          },
        })
        usersMigratedCount++
      } catch (err) {
        console.warn(`⚠️  User ${user.email} skipped`, err instanceof Error ? err.message : '')
      }
    }
    console.log(`✅ ${usersMigratedCount} users migrated\n`)

    // Migrate members AFTER users exist
    console.log('👤 Migrating members...')
    for (const member of members) {
      try {
        // Verify the user exists in PostgreSQL
        const userExists = await prisma.user.findUnique({
          where: { id: member.userId },
        })

        if (!userExists) {
          console.warn(`⚠️  Member ${member.memberNumber} skipped - userId ${member.userId} not found`)
          continue
        }

        await prisma.member.upsert({
          where: { memberNumber: member.memberNumber },
          update: {
            totalSpent: parseFloat(member.totalSpent) || 0,
            eventsCount: parseInt(member.eventsCount) || 0,
            referralsCount: parseInt(member.referralsCount) || 0,
            clientLevel: parseInt(member.clientLevel) || 0,
            eventLevel: parseInt(member.eventLevel) || 0,
            ambassadorLevel: parseInt(member.ambassadorLevel) || 0,
            totalPins: parseInt(member.totalPins) || 0,
            isDiamond: member.isDiamond === 1 || member.isDiamond === true,
          },
          create: {
            id: member.id,
            userId: member.userId,
            memberNumber: member.memberNumber,
            totalSpent: parseFloat(member.totalSpent) || 0,
            eventsCount: parseInt(member.eventsCount) || 0,
            referralsCount: parseInt(member.referralsCount) || 0,
            clientLevel: parseInt(member.clientLevel) || 0,
            eventLevel: parseInt(member.eventLevel) || 0,
            ambassadorLevel: parseInt(member.ambassadorLevel) || 0,
            totalPins: parseInt(member.totalPins) || 0,
            isDiamond: member.isDiamond === 1 || member.isDiamond === true,
            createdAt: member.createdAt ? new Date(member.createdAt) : new Date(),
            updatedAt: member.updatedAt ? new Date(member.updatedAt) : new Date(),
          },
        })
        membersMigratedCount++
      } catch (err) {
        console.warn(`⚠️  Member ${member.memberNumber} skipped`, err instanceof Error ? err.message : '')
      }
    }
    console.log(`✅ ${membersMigratedCount} members migrated\n`)

    // Migrate events
    console.log('📅 Migrating events...')
    let eventsMigratedCount = 0
    for (const event of events) {
      try {
        await prisma.event.upsert({
          where: { id: event.id },
          update: {
            date: event.date ? new Date(event.date) : new Date(),
          },
          create: {
            id: event.id,
            name: event.name,
            date: event.date ? new Date(event.date) : new Date(),
            createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
            updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date(),
          },
        })
        eventsMigratedCount++
      } catch (err) {
        console.warn(`⚠️  Event ${event.id} skipped`, err instanceof Error ? err.message : '')
      }
    }
    console.log(`✅ ${eventsMigratedCount} events migrated\n`)

    // Migrate purchases
    console.log('💳 Migrating purchases...')
    let purchasesMigratedCount = 0
    for (const purchase of purchases) {
      try {
        const memberExists = await prisma.member.findUnique({
          where: { id: purchase.memberId },
        })

        if (!memberExists) {
          console.warn(`⚠️  Purchase ${purchase.id} skipped - memberId ${purchase.memberId} not found`)
          continue
        }

        await prisma.purchase.upsert({
          where: { id: purchase.id },
          update: {
            amount: parseFloat(purchase.amount) || 0,
            date: purchase.date ? new Date(purchase.date) : new Date(),
            note: purchase.note,
          },
          create: {
            id: purchase.id,
            memberId: purchase.memberId,
            amount: parseFloat(purchase.amount) || 0,
            date: purchase.date ? new Date(purchase.date) : new Date(),
            note: purchase.note,
            createdAt: purchase.createdAt ? new Date(purchase.createdAt) : new Date(),
            updatedAt: purchase.updatedAt ? new Date(purchase.updatedAt) : new Date(),
          },
        })
        purchasesMigratedCount++
      } catch (err) {
        console.warn(`⚠️  Purchase ${purchase.id} skipped`, err instanceof Error ? err.message : '')
      }
    }
    console.log(`✅ ${purchasesMigratedCount} purchases migrated\n`)

    // Migrate referrals
    console.log('🎯 Migrating referrals...')
    let referralsMigratedCount = 0
    for (const referral of referrals) {
      try {
        const referrerExists = await prisma.member.findUnique({
          where: { id: referral.referrerId },
        })

        const referredExists = await prisma.member.findUnique({
          where: { id: referral.referredMemberId },
        })

        if (!referrerExists) {
          console.warn(`⚠️  Referral ${referral.id} skipped - referrerId ${referral.referrerId} not found`)
          continue
        }

        if (!referredExists) {
          console.warn(`⚠️  Referral ${referral.id} skipped - referredMemberId ${referral.referredMemberId} not found`)
          continue
        }

        await prisma.referral.upsert({
          where: { id: referral.id },
          update: {
            date: referral.date ? new Date(referral.date) : new Date(),
            status: referral.status,
            note: referral.note,
          },
          create: {
            id: referral.id,
            referrerId: referral.referrerId,
            referredMemberId: referral.referredMemberId,
            date: referral.date ? new Date(referral.date) : new Date(),
            status: referral.status,
            note: referral.note,
            createdAt: referral.createdAt ? new Date(referral.createdAt) : new Date(),
            updatedAt: referral.updatedAt ? new Date(referral.updatedAt) : new Date(),
          },
        })
        referralsMigratedCount++
      } catch (err) {
        console.warn(`⚠️  Referral ${referral.id} skipped`, err instanceof Error ? err.message : '')
      }
    }
    console.log(`✅ ${referralsMigratedCount} referrals migrated\n`)

    sqliteDb.close()

    return NextResponse.json({
      success: true,
      message: '🎉 Migration completed successfully!',
      data: {
        users_migrated: usersMigratedCount,
        members_migrated: membersMigratedCount,
        events_migrated: eventsMigratedCount,
        purchases_migrated: purchasesMigratedCount,
        referrals_migrated: referralsMigratedCount,
        total_records: usersMigratedCount + membersMigratedCount + eventsMigratedCount + purchasesMigratedCount + referralsMigratedCount,
      },
    })
  } catch (error) {
    console.error('❌ Migration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
