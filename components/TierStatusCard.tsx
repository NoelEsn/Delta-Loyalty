'use client'

interface TierStatusCardProps {
  tierStatus: string
  memberNumber: string
  qrCode?: string
}

export default function TierStatusCard({
  tierStatus,
  memberNumber,
  qrCode,
}: TierStatusCardProps) {
  return (
    <div className="relative w-full aspect-[1.6/1] brutalist-card rounded-none overflow-hidden p-8 flex flex-col justify-between shadow-[20px_20px_60px_rgba(0,0,0,0.1)]">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="30" id="grid-pattern" patternUnits="userSpaceOnUse" width="30">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5"></path>
            </pattern>
          </defs>
          <rect fill="url(#grid-pattern)" height="100%" width="100%"></rect>
        </svg>
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1">
            Tier Status
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold uppercase tracking-tight text-white">
              {tierStatus}
            </span>
            <span className="material-symbols-outlined text-white text-sm">verified</span>
          </div>
        </div>

        {qrCode && (
          <div className="w-12 h-12 bg-white rounded-none p-1 flex items-center justify-center grayscale contrast-125">
            <img alt="QR Member ID" className="w-full h-full" src={qrCode} />
          </div>
        )}
      </div>

      <div className="flex flex-col relative z-10">
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1">
          Member ID
        </span>
        <span className="font-mono text-lg tracking-widest uppercase text-white">
          {memberNumber}
        </span>
      </div>
    </div>
  )
}
