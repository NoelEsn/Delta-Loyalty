'use client'

interface Tab {
  id: string
  label: string
}

interface TabNavProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex gap-4 border-b border-black">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-0 py-3 text-xs tracking-widest font-black uppercase whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? 'border-b-2 border-black text-black'
              : 'border-b-2 border-transparent text-black/40 hover:text-black'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
