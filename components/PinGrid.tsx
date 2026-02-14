'use client'

import PinCard from './PinCard'

interface PinConfig {
  icon?: string
  label: string
  metallic: 'bronze' | 'silver' | 'gold' | 'diamond'
  unlocked: boolean
  imageUrl?: string
}

interface PinGridProps {
  pins: PinConfig[]
  totalPins: number
  isDiamondLocked: boolean
  onPinClick?: (index: number) => void
}

export default function PinGrid({
  pins,
  totalPins,
  isDiamondLocked,
  onPinClick,
}: PinGridProps) {
  const unlockedPins = pins.filter(pin => pin.unlocked)

  return (
    <div className="flex-grow">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
        <h2 className="text-[10px] uppercase tracking-[0.4em] font-black">Ma Collection</h2>
        <span className="text-[10px] font-mono font-bold">{unlockedPins.length.toString().padStart(2, '0')}/{pins.length}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {pins.map((pin, index) => (
          <PinCard
            key={index}
            icon={pin.icon}
            imageUrl={pin.imageUrl}
            label={pin.label}
            metallic={pin.metallic}
            unlocked={pin.unlocked}
            onClick={() => onPinClick?.(index)}
          />
        ))}
      </div>
    </div>
  )
}
