'use client'

import { PROGRESS_THRESHOLDS } from '@/lib/progressConfig'
import { isLevelUnlocked } from '@/lib/progressHelpers'
import { PinBadge } from './PinBadge'

interface PinsCollectionProps {
  totalSpent: number
  eventsCount: number
  referralsCount: number
  isDiamond: boolean
}

export function PinsCollection({
  totalSpent,
  eventsCount,
  referralsCount,
  isDiamond,
}: PinsCollectionProps) {
  const spendingVertical = PROGRESS_THRESHOLDS.find((v) => v.id === 'spending')!
  const eventsVertical = PROGRESS_THRESHOLDS.find((v) => v.id === 'events')!
  const referralsVertical = PROGRESS_THRESHOLDS.find((v) => v.id === 'referrals')!

  return (
    <div className="space-y-8">
      {/* Spending Pins */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          Spending Pins
        </h3>
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {spendingVertical.levels.map((level) => (
            <PinBadge
              key={`spending-${level.level}`}
              vertical={spendingVertical}
              levelConfig={level}
              unlocked={isLevelUnlocked(totalSpent, level.level, spendingVertical)}
            />
          ))}
        </div>
      </div>

      {/* Events Pins */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Event Pins
        </h3>
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {eventsVertical.levels.map((level) => (
            <PinBadge
              key={`events-${level.level}`}
              vertical={eventsVertical}
              levelConfig={level}
              unlocked={isLevelUnlocked(eventsCount, level.level, eventsVertical)}
            />
          ))}
        </div>
      </div>

      {/* Referrals Pins */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          Referral Pins
        </h3>
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {referralsVertical.levels.map((level) => (
            <PinBadge
              key={`referrals-${level.level}`}
              vertical={referralsVertical}
              levelConfig={level}
              unlocked={isLevelUnlocked(referralsCount, level.level, referralsVertical)}
            />
          ))}
        </div>
      </div>

      {/* Diamond Pin - Only if all 3 levels are at max */}
      {isDiamond && (
        <div className="border-t border-dark-700 pt-8">
          <h3 className="text-lg font-bold text-accent-gold mb-4 flex items-center gap-2">
            <span className="text-2xl">💎</span>
            Diamond Achievement
          </h3>
          <div className="bg-gradient-to-r from-accent-gold/10 to-purple-500/10 border border-accent-gold/30 rounded-lg p-6 text-center">
            <div className="text-6xl mb-3">💎</div>
            <h4 className="text-xl font-bold text-accent-gold mb-2">You are an Elite Member!</h4>
            <p className="text-gray-300">
              You&apos;ve unlocked all pins across all axes and earned the Diamond Pin. Welcome to our most exclusive circle.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
