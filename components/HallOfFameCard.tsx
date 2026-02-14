'use client'

interface HallOfFameCardProps {
  variant: 'featured' | 'grid'
  name: string
  title?: string
  pins?: number
  imageUrl: string
  since?: string
}

export default function HallOfFameCard({
  variant,
  name,
  title,
  pins,
  imageUrl,
  since,
}: HallOfFameCardProps) {
  if (variant === 'featured') {
    return (
      <div className="space-y-6">
        <div className="portrait-frame aspect-[4/5] overflow-hidden bg-black shadow-xl">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover grayscale brightness-90 contrast-125"
          />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-[800] tracking-tighter uppercase">{name}</h2>
            {title && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/60 mt-1">
                {title}
              </p>
            )}
          </div>
          {since && (
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest">{since}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Grid variant
  return (
    <div className="space-y-4">
      <div className="portrait-frame aspect-[3/4] overflow-hidden bg-black">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover grayscale contrast-110"
        />
      </div>
      <div>
        <h3 className="text-sm font-black uppercase tracking-tight">{name}</h3>
        {pins !== undefined && (
          <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest mt-1">
            {pins} Pins
          </p>
        )}
      </div>
    </div>
  )
}
