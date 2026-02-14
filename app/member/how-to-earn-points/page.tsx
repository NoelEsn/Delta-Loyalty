'use client'

import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { PROGRESS_THRESHOLDS } from '@/lib/progressConfig'

export default function HowToEarnPointsPage() {
  return (
    <main className="min-h-screen bg-[#F2F2F2] flex flex-col">
      <div className="grainy-bg"></div>
      <div className="max-w-[430px] mx-auto w-full flex flex-col min-h-screen relative z-10">

        {/* Header */}
        <header className="flex flex-col items-center px-6 pt-12 pb-6 relative z-10">
          <div className="mb-6">
            <span className="material-symbols-outlined text-5xl font-light text-black">star</span>
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-black tracking-[0.3em] uppercase leading-none text-black">
              Delta Fraternité
            </h1>
            <span className="text-[10px] uppercase tracking-[0.5em] text-black font-bold mt-3">
              How to Earn Pins
            </span>
          </div>
        </header>

        {/* Main Content */}
        <section className="px-6 py-4 space-y-6 flex-1 relative z-10">
          {/* Spending */}
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h2 className="text-sm font-black tracking-widest uppercase text-black mb-4 flex items-center gap-2">
              <span className="text-lg">💰</span>
              Spending Axis
            </h2>
            <div className="space-y-3">
              {PROGRESS_THRESHOLDS[0]?.levels.map((level) => (
                <div key={`spending-${level.level}`} className="bg-[#F2F2F2] rounded p-3 border border-gray-200">
                  <p className="font-bold text-xs text-black uppercase tracking-tight">Level {level.level + 1}: {level.label}</p>
                  <p className="text-xs text-gray-700 mt-1">{level.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h2 className="text-sm font-black tracking-widest uppercase text-black mb-4 flex items-center gap-2">
              <span className="text-lg">🎯</span>
              Events Axis
            </h2>
            <div className="space-y-3">
              {PROGRESS_THRESHOLDS[1]?.levels.map((level) => (
                <div key={`events-${level.level}`} className="bg-[#F2F2F2] rounded p-3 border border-gray-200">
                  <p className="font-bold text-xs text-black uppercase tracking-tight">Level {level.level + 1}: {level.label}</p>
                  <p className="text-xs text-gray-700 mt-1">{level.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Referrals */}
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h2 className="text-sm font-black tracking-widest uppercase text-black mb-4 flex items-center gap-2">
              <span className="text-lg">🌟</span>
              Referrals Axis
            </h2>
            <div className="space-y-3">
              {PROGRESS_THRESHOLDS[2]?.levels.map((level) => (
                <div key={`referrals-${level.level}`} className="bg-[#F2F2F2] rounded p-3 border border-gray-200">
                  <p className="font-bold text-xs text-black uppercase tracking-tight">Level {level.level + 1}: {level.label}</p>
                  <p className="text-xs text-gray-700 mt-1">{level.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diamond Section */}
          <div className="bg-white rounded-lg p-4 border-2 border-black">
            <h2 className="text-sm font-black tracking-widest uppercase text-black mb-3 flex items-center gap-2">
              <span className="text-lg">💎</span>
              The Diamond Pin
            </h2>
            <p className="text-xs text-gray-700 mb-4">
              Unlock all pins across all three axes to earn the exclusive Diamond Pin. This marks you as an Elite Member of Delta Fraternité.
            </p>
            <div className="bg-[#F2F2F2] p-3 rounded border border-gray-200 text-xs text-gray-700">
              <p className="font-bold text-black mb-2">Requirements:</p>
              <p>✓ Level 3 on Spending Axis</p>
              <p>✓ Level 3 on Events Axis</p>
              <p>✓ Level 3 on Referrals Axis</p>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <section className="px-6 py-4 relative z-10 border-t border-gray-300">
          <Link
            href="/member/dashboard"
            className="block text-center w-full py-2 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </Link>
        </section>

        {/* Bottom Navigation */}
        <BottomNav activeTab="dashboard" />
      </div>
    </main>
  )
}
