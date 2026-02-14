/**
 * Ranking System
 * 
 * Global: Sort by total pins (DESC), then by earliest diamond unlock date
 * Axis: Sort by metric value (spending, events, referrals)
 */

export interface RankingPosition {
  rank: number
  percentile: string
  percentileValue: number
}

/**
 * Calculate percentile badge
 */
export function calculatePercentile(rank: number, total: number): string {
  const percentile = (rank / total) * 100

  if (percentile <= 1) return 'Top 1%'
  if (percentile <= 5) return 'Top 5%'
  if (percentile <= 10) return 'Top 10%'
  if (percentile <= 25) return 'Top 25%'
  if (percentile <= 50) return 'Top 50%'
  return 'Top 100%'
}

/**
 * Get member's rank in global ranking
 */
export function calculateRank(memberId: string, totalPins: number, members: any[]): RankingPosition {
  // Placeholder - will be implemented with database query
  return {
    rank: 1,
    percentile: calculatePercentile(1, members.length),
    percentileValue: 0,
  }
}
