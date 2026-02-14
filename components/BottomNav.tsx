'use client'

import Link from 'next/link'

interface BottomNavProps {
  activeTab?: 'dashboard' | 'store' | 'qr' | 'circle' | 'profile'
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const isActive = (tab: string) => activeTab === tab

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-[#F2F2F2]/95 backdrop-blur-xl border-t border-black/5 pb-10 pt-4 px-10 flex justify-between items-center z-50">
      <Link href="/member/dashboard">
        <button
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('dashboard') ? 'text-black' : 'text-black/40 hover:text-black'
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={isActive('dashboard') ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            grid_view
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest">Dash</span>
        </button>
      </Link>

      <button className="text-black/40 flex flex-col items-center gap-1 hover:text-black transition-colors">
        <span className="material-symbols-outlined text-2xl">shopping_cart</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Store</span>
      </button>

      <button className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl -mt-12 hover:bg-gray-800 transition-colors">
        <span className="material-symbols-outlined">qr_code_scanner</span>
      </button>

      <button className="text-black/40 flex flex-col items-center gap-1 hover:text-black transition-colors">
        <span className="material-symbols-outlined text-2xl">forum</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Circle</span>
      </button>

      <Link href="/member/dashboard">
        <button
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('profile') ? 'text-black' : 'text-black/40 hover:text-black'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">person</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
        </button>
      </Link>
    </nav>
  )
}
