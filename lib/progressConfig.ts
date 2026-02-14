/**
 * Progress Config - Centralized thresholds for all progression axes
 * Corrected thresholds (3 levels per axis, no Level 0):
 * - Spending: L1 (1-499), L2 (500-1499), L3 (1500+)
 * - Events: L1 (1-4), L2 (5-9), L3 (10+)
 * - Referrals: L1 (1-4), L2 (5-9), L3 (10+)
 */

export interface LevelConfig {
  level: number
  min: number
  max?: number // undefined = unlimited
  label: string
  description: string
}

export interface VerticalConfig {
  id: 'spending' | 'events' | 'referrals'
  title: string
  shortTitle: string
  icon: string
  unit: string
  color: string
  bgColor: string
  levels: LevelConfig[]
}

// Centralized thresholds for easier management
export const LEVEL_THRESHOLDS = {
  spending: [1, 500, 1500], // L1: >=1, L2: >=500, L3: >=1500
  events: [1, 5, 10], // L1: >=1, L2: >=5, L3: >=10
  referrals: [1, 5, 10], // L1: >=1, L2: >=5, L3: >=10
}

export const PROGRESS_THRESHOLDS: VerticalConfig[] = [
  {
    id: 'spending',
    title: 'Big Spender',
    shortTitle: 'Spending',
    icon: '💰',
    unit: '$',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    levels: [
      {
        level: 1,
        min: 1,
        max: 499,
        label: 'Bronze',
        description: '$1 – $499',
      },
      {
        level: 2,
        min: 500,
        max: 1499,
        label: 'Silver',
        description: '$500 – $1,499',
      },
      {
        level: 3,
        min: 1500,
        label: 'Gold',
        description: '$1,500+',
      },
    ],
  },
  {
    id: 'events',
    title: 'Event Lover',
    shortTitle: 'Events',
    icon: '🎯',
    unit: 'events',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    levels: [
      {
        level: 1,
        min: 1,
        max: 4,
        label: 'Regular',
        description: '1–4 events',
      },
      {
        level: 2,
        min: 5,
        max: 9,
        label: 'VIP',
        description: '5–9 events',
      },
      {
        level: 3,
        min: 10,
        label: 'Legend',
        description: '10+ events',
      },
    ],
  },
  {
    id: 'referrals',
    title: 'Ambassador',
    shortTitle: 'Referrals',
    icon: '🌟',
    unit: 'referrals',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    levels: [
      {
        level: 1,
        min: 1,
        max: 4,
        label: 'Advocate',
        description: '1–4 referrals',
      },
      {
        level: 2,
        min: 5,
        max: 9,
        label: 'Ambassador',
        description: '5–9 referrals',
      },
      {
        level: 3,
        min: 10,
        label: 'Founder',
        description: '10+ referrals',
      },
    ],
  },
]

export function getVertical(id: 'spending' | 'events' | 'referrals'): VerticalConfig {
  const vertical = PROGRESS_THRESHOLDS.find((v) => v.id === id)
  if (!vertical) throw new Error(`Vertical ${id} not found`)
  return vertical
}
