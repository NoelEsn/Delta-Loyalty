'use client'

import Image from 'next/image'
import { VerticalConfig, LevelConfig } from '@/lib/progressConfig'

interface PinBadgeProps {
  vertical: VerticalConfig
  levelConfig: LevelConfig
  unlocked: boolean
  imageUrl?: string
  className?: string
}

const PIN_ICONS = {
  spending: ['🥉', '🥈', '🥇'],
  events: ['📅', '🎉', '🌟', '⭐'],
  referrals: ['👤', '👥', '👫', '🌍'],
}

export function PinBadge({
  vertical,
  levelConfig,
  unlocked,
  imageUrl,
  className = '',
}: PinBadgeProps) {
  const icons = PIN_ICONS[vertical.id as keyof typeof PIN_ICONS]
  const icon = icons[levelConfig.level] || '📌'

  return (
    <div
      className={`
        relative group
        flex flex-col items-center justify-center
        w-20 h-20 sm:w-24 sm:h-24
        rounded-lg border-2 transition-all duration-200
        overflow-hidden
        ${
          unlocked
            ? `${vertical.bgColor} border-current cursor-pointer hover:scale-110 hover:shadow-lg shadow-md`
            : 'bg-dark-800 border-dark-700 opacity-50 grayscale'
        }
        ${className}
      `}
      title={`${vertical.shortTitle} - Level ${levelConfig.level}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${vertical.shortTitle} ${levelConfig.label}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 80px, 96px"
        />
      ) : (
        <>
          <div className="text-3xl sm:text-4xl mb-1">{icon}</div>
          <div className="text-xs font-bold text-center px-1">
            <div className="text-gray-400">{levelConfig.label}</div>
          </div>
        </>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-dark-900 border border-dark-700 rounded px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg">
          {vertical.title} - {levelConfig.description}
        </div>
      </div>
    </div>
  )
}
