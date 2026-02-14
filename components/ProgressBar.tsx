'use client'

interface ProgressBarProps {
  label: string
  value: number
  max?: number
  percentage: number
  showValue?: boolean
  description?: string
}

export default function ProgressBar({
  label,
  value,
  max,
  percentage,
  showValue = true,
  description,
}: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[9px] uppercase tracking-[0.25em] font-black text-black">
          {label}
        </span>
        {showValue && (
          <span className="text-[10px] font-mono font-bold">
            {max ? `${value}/${max}` : `${percentage}%`}
          </span>
        )}
      </div>
      <div className="h-[1px] w-full bg-black/10">
        <div className="h-full bg-black transition-all duration-500" style={{ width: `${percentage}%` }}></div>
      </div>
      {description && (
        <div className="text-[8px] text-black/70 mt-1">
          {description}
        </div>
      )}
    </div>
  )
}
