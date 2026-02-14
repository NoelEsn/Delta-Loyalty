'use client'

interface RankingCardProps {
  rank: number
  name: string
  pins: number
  percentile?: string
  movement?: 'up' | 'down' | 'none'
  movementAmount?: number
  imageUrl?: string
  initials?: string
}

export default function RankingCard({
  rank,
  name,
  pins,
  percentile,
  movement,
  movementAmount,
  imageUrl,
  initials,
}: RankingCardProps) {
  const getMovementIcon = () => {
    if (movement === 'up') return '▲'
    if (movement === 'down') return '▼'
    return '—'
  }

  const movementColor = movement === 'up' ? 'text-black' : movement === 'down' ? 'text-black' : 'text-black/30'

  return (
    <div className="flex items-center gap-4 p-4 border-b border-black bg-white">
      <span className="w-6 text-[11px] font-black">{rank}</span>
      
      <div className="w-12 h-12 border border-black overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover grayscale"
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <span className="text-[10px] font-black text-white">{initials || '?'}</span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-[12px] font-black uppercase tracking-tight">{name}</h4>
          {percentile && <span className="percentile-badge">{percentile}</span>}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
          {pins} PINS
        </p>
      </div>

      <div className={`text-[10px] font-black ${movementColor}`}>
        {movement === 'none' ? '—' : `${getMovementIcon()} ${movementAmount || ''}`}
      </div>
    </div>
  )
}
