'use client'

import Image from 'next/image'

interface PinCardProps {
  icon?: string
  imageUrl?: string
  label: string
  metallic: 'bronze' | 'silver' | 'gold' | 'diamond'
  unlocked: boolean
  onClick?: () => void
}

export default function PinCard({
  icon,
  imageUrl,
  label,
  metallic,
  unlocked,
  onClick,
}: PinCardProps) {
  return (
    <button
      onClick={unlocked ? onClick : undefined}
      disabled={!unlocked}
      className={`aspect-square bg-white border border-black/5 rounded-lg flex items-center justify-center relative overflow-hidden transition-all ${
        unlocked
          ? 'hover:bg-gray-50 cursor-pointer'
          : 'cursor-not-allowed'
      }`}
    >
      <div className={`absolute inset-0 flex items-center justify-center ${!unlocked ? 'opacity-50 grayscale blur-sm' : ''}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={label}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100px, 120px"
          />
        ) : (
          <div className={`metallic-${metallic} w-10 h-10 flex items-center justify-center`}>
            <span className="material-symbols-outlined text-white/90 text-lg">
              {icon}
            </span>
          </div>
        )}
        <span className="absolute bottom-1 text-[7px] uppercase tracking-tighter text-black/40 font-bold">
          {label}
        </span>
      </div>

      {!unlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg z-10">
          <div className="bg-black rounded-full p-2 mb-1">
            <span className="material-symbols-outlined text-white text-4xl font-black">
              lock
            </span>
          </div>
          <span className="text-[8px] uppercase tracking-tighter text-black font-black bg-white px-2 py-0.5 rounded">
            Verrouillé
          </span>
        </div>
      )}
    </button>
  )
}
