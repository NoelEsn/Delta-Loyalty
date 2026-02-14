/**
 * Pin Logic Engine
 * 
 * Pin Structure:
 * - 3 axes: Client (spending), Events (attendance), Ambassador (referrals)
 * - Each axis has 3 levels: Bronze (1), Silver (2), Gold (3) = 9 total pins
 * - Diamond (10th pin) unlocked when all 9 pins are collected
 */

export interface Metrics {
  totalSpent: number
  eventsCount: number
  referralsCount: number
}

export interface PinLevels {
  clientLevel: number      // 0-3 (0=none, 1=bronze, 2=silver, 3=gold)
  eventLevel: number       // 0-3
  ambassadorLevel: number  // 0-3
}

/**
 * Determine pin levels from metrics
 */
export function determinePinLevels(metrics: Metrics): PinLevels {
  return {
    clientLevel: determineSingleLevel(metrics.totalSpent, [1, 500, 1500]),
    eventLevel: determineSingleLevel(metrics.eventsCount, [1, 5, 10]),
    ambassadorLevel: determineSingleLevel(metrics.referralsCount, [1, 5, 10]),
  }
}

/**
 * Determine level (0-3) based on thresholds
 */
function determineSingleLevel(value: number, thresholds: [number, number, number]): number {
  if (value >= thresholds[2]) return 3  // Gold
  if (value >= thresholds[1]) return 2  // Silver
  if (value >= thresholds[0]) return 1  // Bronze
  return 0  // Locked
}

/**
 * Calculate total pins (count of unlocked pins)
 */
export function calculateTotalPins(levels: PinLevels): number {
  return (
    (levels.clientLevel > 0 ? 1 : 0) +
    (levels.clientLevel > 1 ? 1 : 0) +
    (levels.clientLevel > 2 ? 1 : 0) +
    (levels.eventLevel > 0 ? 1 : 0) +
    (levels.eventLevel > 1 ? 1 : 0) +
    (levels.eventLevel > 2 ? 1 : 0) +
    (levels.ambassadorLevel > 0 ? 1 : 0) +
    (levels.ambassadorLevel > 1 ? 1 : 0) +
    (levels.ambassadorLevel > 2 ? 1 : 0)
  )
}

/**
 * Check if member is eligible for Diamond (all 9 pins)
 */
export function isDiamondEligible(levels: PinLevels): boolean {
  return levels.clientLevel === 3 && levels.eventLevel === 3 && levels.ambassadorLevel === 3
}

/**
 * Get progress to next level
 */
export function getProgressToNextLevel(metrics: Metrics) {
  const clientNext = metrics.totalSpent < 1 ? 1 - metrics.totalSpent : metrics.totalSpent < 500 ? 500 - metrics.totalSpent : 1500 - metrics.totalSpent
  const eventNext = metrics.eventsCount < 1 ? 1 - metrics.eventsCount : metrics.eventsCount < 5 ? 5 - metrics.eventsCount : 10 - metrics.eventsCount
  const ambassadorNext = metrics.referralsCount < 1 ? 1 - metrics.referralsCount : metrics.referralsCount < 5 ? 5 - metrics.referralsCount : 10 - metrics.referralsCount

  return {
    client: Math.max(0, clientNext),
    events: Math.max(0, eventNext),
    ambassador: Math.max(0, ambassadorNext),
  }
}

/**
 * Get user-friendly progress message
 */
export function getProgressMessage(metric: string, value: number, needed: number): string {
  const remaining = Math.max(0, needed - value)
  if (remaining === 0) return `✓ ${metric} pin unlocked!`
  return `${remaining} ${metric.toLowerCase()} left to unlock pin`
}
