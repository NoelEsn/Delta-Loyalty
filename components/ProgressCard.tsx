'use client'

import { VerticalConfig } from '@/lib/progressConfig'
import {
  getCurrentLevel,
  getProgressPercent,
  getRemainingToNextLevel,
  getNextLevel,
  getRangeForLevel,
  formatValue,
} from '@/lib/progressHelpers'

interface ProgressCardProps {
  vertical: VerticalConfig
  value: number
}

// Map of vertical IDs to their background colors
const BG_COLOR_MAP: Record<'spending' | 'events' | 'referrals', string> = {
  spending: 'bg-amber-500',
  events: 'bg-blue-500',
  referrals: 'bg-purple-500',
}

// Map of vertical IDs to their RGB values for inline style fallback
const RGB_COLOR_MAP: Record<'spending' | 'events' | 'referrals', string> = {
  spending: 'rgb(217, 119, 6)',     // amber-500
  events: 'rgb(59, 130, 246)',      // blue-500
  referrals: 'rgb(168, 85, 247)',   // purple-500
}

export function ProgressCard({ vertical, value }: ProgressCardProps) {
  const currentLevel = getCurrentLevel(value, vertical)
  const progressPercent = getProgressPercent(value, vertical)
  const remaining = getRemainingToNextLevel(value, vertical)
  const nextLevel = getNextLevel(value, vertical)
  const rangeInfo = getRangeForLevel(value, vertical)
  const isNotStarted = value === 0
  const isMaxLevel = currentLevel === 3

  const bgColorClass = BG_COLOR_MAP[vertical.id]
  const rgbColor = RGB_COLOR_MAP[vertical.id]

  return (
    <div className={`card p-6 border ${vertical.bgColor}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">{vertical.icon}</span>
            {vertical.title}
          </h3>
          {isNotStarted ? (
            <p className="text-gray-400 text-sm mt-1">Not started</p>
          ) : (
            <p className="text-gray-400 text-sm mt-1">
              Level {currentLevel} / 3
            </p>
          )}
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${vertical.color}`}>{formatValue(value, vertical.unit)}</p>
          {!isNotStarted && rangeInfo && <p className="text-gray-400 text-xs mt-1">{rangeInfo.label}</p>}
        </div>
      </div>

      {/* Current Level Info or Not Started */}
      {isNotStarted ? (
        <div className="bg-dark-800 rounded p-3 mb-4 text-sm">
          <p className="text-gray-300">
            Start earning: <span className="text-white font-semibold">+1 {vertical.unit}</span>
          </p>
        </div>
      ) : (
        <div className="bg-dark-800 rounded p-3 mb-4 text-sm">
          <p className="text-gray-300">
            Current Range: <span className="text-white font-semibold">{rangeInfo?.description}</span>
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-300">Progress to Next Level</span>
          <span className={`text-lg font-bold ${vertical.color}`}>{Math.round(progressPercent)}%</span>
        </div>
        <div className="relative w-full bg-dark-700 rounded-full h-4 overflow-hidden border border-dark-600">
          <div
            className={`h-full rounded-full transition-all duration-500 ${bgColorClass}`}
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: rgbColor,
            }}
          />
        </div>
      </div>

      {/* Next Level Info */}
      {isNotStarted ? (
        <div className="border-t border-dark-700 pt-4">
          <p className={`text-sm ${vertical.color}`}>
            🎯 Reach {formatValue(1, vertical.unit)} to unlock Level 1
          </p>
        </div>
      ) : isMaxLevel ? (
        <div className="border-t border-dark-700 pt-4">
          <p className="text-sm text-accent-gold font-bold">🏆 Maximum level reached!</p>
        </div>
      ) : (
        <div className="border-t border-dark-700 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Next Level</span>
            <span className="text-sm font-bold text-accent-gold">Level {nextLevel}</span>
          </div>
          <p className={`text-sm ${vertical.color}`}>
            {remaining! > 0
              ? `${remaining! < 10 ? '🔥 ' : ''}+${formatValue(remaining!, vertical.unit)} to reach Level ${nextLevel}`
              : '✓ Ready for next level!'}
          </p>
        </div>
      )}
    </div>
  )
}
