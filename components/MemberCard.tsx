'use client'

interface StandardBadge {
  icon: string
  metallic: 'bronze' | 'silver' | 'gold'
  unlocked: boolean
  imageUrl?: string
}

interface DiamondBadge {
  icon: string
  metallic: 'diamond'
  unlocked: boolean
  imageUrl?: string
}

interface MemberCardProps {
  tierStatus: string
  memberName: string
  memberId: string
  qrCode?: string
  standardBadges: StandardBadge[]
  diamondBadge: DiamondBadge
}

export default function MemberCard({
  tierStatus,
  memberName,
  memberId,
  qrCode,
  standardBadges,
  diamondBadge,
}: MemberCardProps) {
  return (
    <div className="relative w-full matte-card rounded-2xl overflow-hidden p-6 flex flex-col justify-between border border-white/10">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="30" id="grid-pattern-member" patternUnits="userSpaceOnUse" width="30">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5"></path>
            </pattern>
          </defs>
          <rect fill="url(#grid-pattern-member)" height="100%" width="100%"></rect>
        </svg>
      </div>

      {/* Header with Tier Status and QR Code */}
      <div className="flex justify-between items-start relative z-10 mb-8">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1">
            Tier Status
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold uppercase tracking-tight text-white">
              {tierStatus}
            </span>
            <span className="material-symbols-outlined text-[#fbbf24] text-base fill-1">
              verified
            </span>
          </div>
        </div>

        {qrCode && (
          <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center">
            <img
              alt="QR Member ID"
              className="w-full h-full grayscale"
              src={qrCode}
            />
          </div>
        )}
      </div>

      {/* Member Info */}
      <div className="flex flex-col relative z-10 mb-8">
        <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1">
          Member Name
        </span>
        <span className="text-xl font-bold uppercase tracking-widest text-white mb-4">
          {memberName}
        </span>
        <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1">
          Member ID
        </span>
        <span className="font-mono text-sm tracking-widest uppercase text-white/80">
          {memberId}
        </span>
      </div>

      {/* Earned Badges - Grid 3x3 + Diamond */}
      <div className="relative z-10 border-t border-white/10 pt-4">
        <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 font-bold mb-4 block">
          Earned Badges
        </span>
        
        <div className="flex gap-4 items-center">
          {/* 3x3 Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-2">
              {standardBadges.map((badge, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-lg flex items-center justify-center relative overflow-hidden transition-all ring-1 ${
                    badge.unlocked
                      ? 'ring-white/20 bg-white'
                      : 'ring-white/10 bg-white'
                  }`}
                >
                  <div className={`absolute inset-0 flex items-center justify-center ${!badge.unlocked ? 'opacity-50 grayscale blur-sm' : ''}`}>
                    {badge.imageUrl ? (
                      <img
                        src={badge.imageUrl}
                        alt={badge.icon}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-white/90 text-lg">
                        {badge.icon}
                      </span>
                    )}
                  </div>

                  {!badge.unlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg z-10">
                      <div className="bg-black rounded-full p-1">
                        <span className="material-symbols-outlined text-white text-xl font-black">
                          lock
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Diamond Badge */}
          <div className="w-24 flex-shrink-0">
            <div
              className={`w-full aspect-square rounded-lg flex items-center justify-center flex-col relative overflow-hidden transition-all ring-1 ${
                diamondBadge.unlocked
                  ? 'ring-white/20 bg-white'
                  : 'ring-white/10 bg-white'
              }`}
            >
              <div className={`absolute inset-0 flex flex-col items-center justify-center ${!diamondBadge.unlocked ? 'opacity-50 grayscale blur-sm' : ''}`}>
                {diamondBadge.imageUrl ? (
                  <img
                    src={diamondBadge.imageUrl}
                    alt="diamond"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <span className="material-symbols-outlined text-white/90 text-2xl">
                    {diamondBadge.icon}
                  </span>
                )}
                <span className="text-[7px] uppercase tracking-tight text-white/80 font-bold mt-1">
                  Diamond
                </span>
              </div>

              {!diamondBadge.unlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg z-10">
                  <div className="bg-black rounded-full p-1">
                    <span className="material-symbols-outlined text-white text-xl font-black">
                      lock
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
