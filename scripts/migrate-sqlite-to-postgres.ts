import sqlite3 from 'sqlite3'
import { prisma } from '../lib/db.js'

async function migrate() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...\n')

  const db = new sqlite3.Database('./prisma/delta-fraternite.db')

  try {
    // Helper function to query SQLite
    const sqliteQuery = (sql: string): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => {
          if (err) reject(err)
          else resolve(rows || [])
        })
      })
    }

    // Step 1: Read all data from SQLite
    console.log('📖 Reading data from SQLite...')
    const users = await sqliteQuery('SELECT * FROM users')
    const members = await sqliteQuery('SELECT * FROM members')
    const events = await sqliteQuery('SELECT * FROM events')
    const purchases = await sqliteQuery('SELECT * FROM purchases')
    const referrals = await sqliteQuery('SELECT * FROM referrals')
    const globalSettings = await sqliteQuery('SELECT * FROM global_settings')

    console.log(`✅ Data read:
  - ${users.length} users
  - ${members.length} members
  - ${events.length} events
  - ${purchases.length} purchases
  - ${referrals.length} referrals
  - ${globalSettings.length} global settings\n`)

    // Step 2: Write to PostgreSQL
    console.log('✍️  Writing to PostgreSQL (Supabase)...\n')

    // Users first
    let userCount = 0
    for (const user of users) {
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            password_hash: user.password_hash,
            role: user.role,
            updatedAt: new Date(user.updatedAt),
          },
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
            password_hash: user.password_hash,
            role: user.role,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          },
        })
        userCount++
      } catch (err) {
        console.warn(`⚠️  User ${user.email} skipped`)
      }
    }
    console.log(`✅ ${userCount}/${users.length} users migrated`)

    // Members
    let memberCount = 0
    for (const member of members) {
      try {
        await prisma.member.upsert({
          where: { memberNumber: member.memberNumber },
          update: {
            totalSpent: member.totalSpent,
            eventsCount: member.eventsCount,
            referralsCount: member.referralsCount,
            clientLevel: member.clientLevel,
            eventLevel: member.eventLevel,
            ambassadorLevel: member.ambassadorLevel,
            totalPins: member.totalPins,
            isDiamond: member.isDiamond,
            updatedAt: new Date(member.updatedAt),
          },
          create: {
            id: member.id,
            userId: member.userId,
            memberNumber: member.memberNumber,
            totalSpent: member.totalSpent,
            eventsCount: member.eventsCount,
            referralsCount: member.referralsCount,
            clientLevel: member.clientLevel,
            eventLevel: member.eventLevel,
            ambassadorLevel: member.ambassadorLevel,
            totalPins: member.totalPins,
            isDiamond: member.isDiamond,
            createdAt: new Date(member.createdAt),
            updatedAt: new Date(member.updatedAt),
          },
        })
        memberCount++
      } catch (err) {
        console.warn(`⚠️  Member ${member.memberNumber} skipped`)
      }
    }
    console.log(`✅ ${memberCount}/${members.length} members migrated`)

    // Events
    let eventCount = 0
    for (const event of events) {
      try {
        await prisma.event.upsert({
          where: { id: event.id },
          update: {
            date: new Date(event.date),
            updatedAt: new Date(event.updatedAt),
          },
          create: {
            id: event.id,
            name: event.name,
            date: new Date(event.date),
            createdAt: new Date(event.createdAt),
            updatedAt: new Date(event.updatedAt),
          },
        })
        eventCount++
      } catch (err) {
        console.warn(`⚠️  Event ${event.id} skipped`)
      }
    }
    console.log(`✅ ${eventCount}/${events.length} events migrated`)

    // Purchases
    let purchaseCount = 0
    for (const purchase of purchases) {
      try {
        await prisma.purchase.upsert({
          where: { id: purchase.id },
          update: {
            amount: purchase.amount,
            date: new Date(purchase.date),
            note: purchase.note,
            updatedAt: new Date(purchase.updatedAt),
          },
          create: {
            id: purchase.id,
            memberId: purchase.memberId,
            amount: purchase.amount,
            date: new Date(purchase.date),
            note: purchase.note,
            createdAt: new Date(purchase.createdAt),
            updatedAt: new Date(purchase.updatedAt),
          },
        })
        purchaseCount++
      } catch (err) {
        console.warn(`⚠️  Purchase ${purchase.id} skipped`)
      }
    }
    console.log(`✅ ${purchaseCount}/${purchases.length} purchases migrated`)

    // Referrals
    let referralCount = 0
    for (const referral of referrals) {
      try {
        await prisma.referral.upsert({
          where: { id: referral.id },
          update: {
            date: new Date(referral.date),
            status: referral.status,
            note: referral.note,
            updatedAt: new Date(referral.updatedAt),
          },
          create: {
            id: referral.id,
            referrerId: referral.referrerId,
            referredMemberId: referral.referredMemberId,
            date: new Date(referral.date),
            status: referral.status,
            note: referral.note,
            createdAt: new Date(referral.createdAt),
            updatedAt: new Date(referral.updatedAt),
          },
        })
        referralCount++
      } catch (err) {
        console.warn(`⚠️  Referral ${referral.id} skipped`)
      }
    }
    console.log(`✅ ${referralCount}/${referrals.length} referrals migrated`)

    console.log('\n🎉 Migration completed successfully!')
    console.log(
      `📊 Total: ${userCount + memberCount + eventCount + purchaseCount + referralCount} records migrated`
    )
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  } finally {
    db.close()
    await prisma.$disconnect()
  }
}

migrate()


