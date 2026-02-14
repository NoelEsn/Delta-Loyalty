import { PrismaClient } from '@prisma/client'
import { determinePinLevels, calculateTotalPins, isDiamondEligible } from './pinEngine'

// Create a singleton instance of PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Generate unique member number
 * Format: DF-2024-00001
 */
export async function generateMemberNumber(): Promise<string> {
  const count = await prisma.member.count()
  const year = new Date().getFullYear()
  const number = String(count + 1).padStart(5, '0')
  return `DF-${year}-${number}`
}

/**
 * Calculate and update member metrics
 * Should be called after every admin action (purchase, event, referral)
 */
export async function recalculateMember(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      purchases: true,
      eventParticipations: true,
      referralsGiven: true,
    },
  })

  if (!member) throw new Error(`Member ${memberId} not found`)

  // Calculate metrics
  const totalSpent = member.purchases.reduce((sum, p) => sum + p.amount, 0)
  const eventsCount = member.eventParticipations.length
  // Count only ACTIVE referrals
  const referralsCount = member.referralsGiven.filter(
    (ref) => ref.status === 'ACTIVE'
  ).length

  // Determine pin levels
  const levels = determinePinLevels({
    totalSpent,
    eventsCount,
    referralsCount,
  })

  // Calculate total pins
  const totalPins = calculateTotalPins(levels)

  // Update member
  const updatedMember = await prisma.member.update({
    where: { id: memberId },
    data: {
      totalSpent,
      eventsCount,
      referralsCount,
      clientLevel: levels.clientLevel,
      eventLevel: levels.eventLevel,
      ambassadorLevel: levels.ambassadorLevel,
      totalPins,
    },
  })

  return updatedMember
}

/**
 * Get global settings
 */
export async function getGlobalSettings() {
  let settings = await prisma.globalSettings.findFirst()
  
  if (!settings) {
    settings = await prisma.globalSettings.create({
      data: {
        hallOfFameActive: false,
      },
    })
  }

  return settings
}

/**
 * Get all members for public display
 */
export async function getAllMembers() {
  return await prisma.member.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}
