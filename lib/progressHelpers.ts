import { LevelConfig, VerticalConfig, LEVEL_THRESHOLDS } from './progressConfig'

/**
 * Get current level based on value and vertical config
 * Returns 0 if value < 1 (not started), otherwise 1, 2, or 3
 */
export function getCurrentLevel(value: number, vertical: VerticalConfig): number {
  if (value === 0) return 0 // Not started
  
  const levelConfig = vertical.levels.find((l) => value >= l.min && (!l.max || value <= l.max))
  return levelConfig ? levelConfig.level : 0
}

/**
 * Get the level config for a specific level
 */
export function getLevelConfig(level: number, vertical: VerticalConfig): LevelConfig | null {
  return vertical.levels.find((l) => l.level === level) || null
}

/**
 * Get range for current level (min, max, nextLevelThreshold)
 */
export function getRangeForLevel(value: number, vertical: VerticalConfig): {
  level: number
  min: number
  max?: number
  nextLevelThreshold?: number
  label: string
  description: string
} | null {
  if (value === 0) return null // Not started, no range
  
  const currentLevel = getCurrentLevel(value, vertical)
  const levelConfig = getLevelConfig(currentLevel, vertical)
  if (!levelConfig) return null
  
  // Get next level threshold if exists
  const nextLevelConfig = vertical.levels.find((l) => l.level === currentLevel + 1)
  
  return {
    level: currentLevel,
    min: levelConfig.min,
    max: levelConfig.max,
    nextLevelThreshold: nextLevelConfig?.min,
    label: levelConfig.label,
    description: levelConfig.description,
  }
}

/**
 * Get progress percentage towards NEXT level only (0-100)
 * - If value = 0: progress from 0 to min of level 1
 * - Otherwise: progress from current value to min of next level
 * - If already at max level: return 100
 */
export function getProgressPercent(value: number, vertical: VerticalConfig): number {
  const level1Min = vertical.levels[0].min // Usually 1
  
  // If at 0 (not started yet): progress from 0 to level 1 threshold
  if (value === 0) {
    return 0 // Start of the bar, 0% progress
  }
  
  const currentLevel = getCurrentLevel(value, vertical)
  if (currentLevel === 0) return 0
  
  const nextLevelConfig = vertical.levels.find((l) => l.level === currentLevel + 1)
  
  // Already at max level
  if (!nextLevelConfig) return 100
  
  // Progress from current value to next level min
  const nextLevelMin = nextLevelConfig.min
  const currentLevelConfig = vertical.levels.find((l) => l.level === currentLevel)!
  const currentLevelMin = currentLevelConfig.min
  
  // Calculate progress within this level's range
  const progress = ((value - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100
  return Math.min(100, Math.max(0, progress))
}

/**
 * Get the remaining amount/count needed to START (if at 0) or reach NEXT level
 * Returns the AMOUNT still needed, not the absolute value
 */
export function getRemainingToNextLevel(value: number, vertical: VerticalConfig): number | null {
  const level1Min = vertical.levels[0].min
  
  // If not started (value = 0): need to reach level 1 minimum
  if (value === 0) {
    return level1Min
  }
  
  const currentLevel = getCurrentLevel(value, vertical)
  if (currentLevel === 0) return level1Min
  
  const nextLevelConfig = vertical.levels.find((l) => l.level === currentLevel + 1)
  
  // Already at max level
  if (!nextLevelConfig) return null
  
  const remaining = nextLevelConfig.min - value
  return Math.max(0, remaining)
}

/**
 * Get the threshold of the next level (for display/max comparison)
 * Returns the minimum value needed to reach the next level
 * If already at max, returns the current level's min
 */
export function getNextLevelThreshold(value: number, vertical: VerticalConfig): number {
  const currentLevel = getCurrentLevel(value, vertical)
  const nextLevelConfig = vertical.levels.find((l) => l.level === currentLevel + 1)
  
  // If at max level or not started, get the next/current threshold
  if (!nextLevelConfig) {
    const currentConfig = vertical.levels.find((l) => l.level === currentLevel)
    return currentConfig?.min || 1
  }
  
  return nextLevelConfig.min
}

/**
 * Check if a specific level is unlocked
 */
export function isLevelUnlocked(value: number, levelNumber: number, vertical: VerticalConfig): boolean {
  if (value === 0) return false // Nothing unlocked if not started
  
  const targetLevel = vertical.levels.find((l) => l.level === levelNumber)
  if (!targetLevel) return false
  
  return value >= targetLevel.min
}

/**
 * Format value with unit for display
 */
export function formatValue(value: number, unit: string): string {
  if (unit === '$') {
    return `$${value.toLocaleString()}`
  }
  return `${value} ${unit}`
}

/**
 * Check if all 3 verticals are at max level (Diamond eligible)
 * All 3 must be at level 3
 */
export function isDiamondEligible(
  spending: number,
  events: number,
  referrals: number,
  verticals: VerticalConfig[]
): boolean {
  const spendingVertical = verticals.find((v) => v.id === 'spending')!
  const eventsVertical = verticals.find((v) => v.id === 'events')!
  const referralsVertical = verticals.find((v) => v.id === 'referrals')!

  const spendingLevel = getCurrentLevel(spending, spendingVertical)
  const eventsLevel = getCurrentLevel(events, eventsVertical)
  const referralsLevel = getCurrentLevel(referrals, referralsVertical)

  return spendingLevel === 3 && eventsLevel === 3 && referralsLevel === 3
}

/**
 * Get descriptive text for progress bar
 * Shows what's needed to reach the next level (or max level message)
 */
export function getProgressDescription(value: number, vertical: VerticalConfig): string {
  const currentLevel = getCurrentLevel(value, vertical)
  const nextLevelConfig = vertical.levels.find((l) => l.level === currentLevel + 1)
  
  // Already at max level (level 3)
  if (!nextLevelConfig) {
    return 'Niveau maximum atteint'
  }
  
  const remaining = getRemainingToNextLevel(value, vertical)
  if (remaining === null || remaining === 0) {
    return `Atteins le niveau ${nextLevelConfig.level}`
  }
  
  // Get the appropriate message based on vertical type
  if (vertical.id === 'spending') {
    return `Dépense encore ${remaining}€ pour atteindre le niveau ${nextLevelConfig.level}`
  } else if (vertical.id === 'events') {
    const eventText = remaining === 1 ? 'événement' : 'événements'
    return `Participe à ${remaining} ${eventText} de plus pour atteindre le niveau ${nextLevelConfig.level}`
  } else if (vertical.id === 'referrals') {
    const refText = remaining === 1 ? 'parrainage' : 'parrainages'
    return `Obtiens ${remaining} ${refText} de plus pour atteindre le niveau ${nextLevelConfig.level}`
  }
  
  return ''
}
