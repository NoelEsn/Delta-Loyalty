'use client'

interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8 border-b border-black pb-2">
      <h2 className="text-[10px] uppercase tracking-[0.4em] font-black">{title}</h2>
      {subtitle && <span className="text-[10px] font-mono font-bold">{subtitle}</span>}
    </div>
  )
}
