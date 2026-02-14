'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TabNav from '@/components/TabNav'
import RankingCard from '@/components/RankingCard'
import BottomNav from '@/components/BottomNav'

interface RankingMember {
  rank: number
  name: string
  pins: number
  percentile?: string
  movement?: 'up' | 'down' | 'none'
  movementAmount?: number
  imageUrl?: string
  initials?: string
}

interface TopThree {
  rank1: RankingMember
  rank2: RankingMember
  rank3: RankingMember
}

const tabs = [
  { id: 'spending', label: 'Spending' },
  { id: 'events', label: 'Events' },
  { id: 'referrals', label: 'Referrals' },
  { id: 'overall', label: 'Overall' },
]

export default function RankingsPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('spending')
  const [rankings, setRankings] = useState<RankingMember[]>([])
  const [userRank, setUserRank] = useState<RankingMember | null>(null)
  const [topThree, setTopThree] = useState<TopThree | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch(`/api/member/rankings?axis=${activeTab}`)
        if (!response.ok) {
          router.push('/login')
          return
        }
        const data = await response.json()
        setRankings(data.rankings || [])
        setUserRank(data.userRank || null)
        setTopThree(data.topThree || null)
      } catch (error) {
        console.error('Failed to fetch rankings:', error)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchRankings()
  }, [activeTab, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="grainy-bg"></div>
        <div className="relative z-10 text-black">Loading rankings...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2] flex flex-col">
      <div className="grainy-bg"></div>
      <div className="max-w-[430px] mx-auto w-full flex flex-col min-h-screen relative z-10">

        {/* Header */}
        <header className="flex flex-col items-center px-6 pt-12 pb-6 relative z-10 border-b border-gray-300">
          <div className="mb-6">
            <span className="material-symbols-outlined text-5xl font-light text-black">star</span>
          </div>
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl font-black tracking-[0.3em] uppercase leading-none text-black">
              Delta Fraternité
            </h1>
            <span className="text-[10px] uppercase tracking-[0.5em] text-black font-bold mt-3">
              Rankings
            </span>
          </div>
          
          {/* Tab Navigation */}
          <div className="w-full">
            <TabNav
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </header>

        {/* Season Info */}
        <section className="px-6 py-3 flex justify-between items-center border-b border-gray-300 text-xs font-bold text-black uppercase tracking-wider">
          <span>Season 01 / Genesis</span>
          <span>Active</span>
        </section>

        {/* Top 3 Podium */}
        {topThree && (
          <section className="grid grid-cols-3 border-b border-gray-300 bg-[#F2F2F2]">
            {/* Rank 2 */}
            <div className="flex flex-col items-center pt-6 pb-4 border-r border-gray-300 px-2">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-white border border-gray-400 p-1">
                  {topThree.rank2?.imageUrl ? (
                    <img
                      alt={topThree.rank2.name}
                      className="w-full h-full object-cover grayscale"
                      src={topThree.rank2.imageUrl}
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <span className="text-[8px] font-black text-white">{topThree.rank2?.initials}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-1.5">
                  02
                </div>
              </div>
              <span className="text-[9px] font-black truncate w-full text-center uppercase tracking-tight">
                {topThree.rank2?.name}
              </span>
              <span className="text-[8px] font-bold text-gray-700 uppercase">
                {topThree.rank2?.pins} PINS
              </span>
            </div>

            {/* Rank 1 - Center (larger) */}
            <div className="flex flex-col items-center pt-4 pb-4 bg-black text-white px-2">
              <div className="relative mb-3">
                <div className="w-20 h-20 bg-white border-2 border-white p-1">
                  {topThree.rank1?.imageUrl ? (
                    <img
                      alt={topThree.rank1.name}
                      className="w-full h-full object-cover"
                      src={topThree.rank1.imageUrl}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <span className="text-[10px] font-black text-white">{topThree.rank1?.initials}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black">
                  <span className="material-symbols-outlined text-white text-base">star</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black px-1.5">
                  01
                </div>
              </div>
              <span className="text-[10px] font-black truncate w-full text-center uppercase tracking-tight">
                {topThree.rank1?.name}
              </span>
              <span className="text-[8px] font-bold text-white/70 uppercase">
                {topThree.rank1?.pins} PINS
              </span>
            </div>

            {/* Rank 3 */}
            <div className="flex flex-col items-center pt-6 pb-4 border-l border-gray-300 px-2">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-white border border-gray-400 p-1">
                  {topThree.rank3?.imageUrl ? (
                    <img
                      alt={topThree.rank3.name}
                      className="w-full h-full object-cover grayscale"
                      src={topThree.rank3.imageUrl}
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <span className="text-[8px] font-black text-white">{topThree.rank3?.initials}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-1.5">
                  03
                </div>
              </div>
              <span className="text-[9px] font-black truncate w-full text-center uppercase tracking-tight">
                {topThree.rank3?.name}
              </span>
              <span className="text-[8px] font-bold text-gray-700 uppercase">
                {topThree.rank3?.pins} PINS
              </span>
            </div>
          </section>
        )}

        {/* Rankings List */}
        <section className="flex-1 bg-[#F2F2F2] relative z-10">
          {rankings.map((member) => (
            <RankingCard
              key={member.rank}
              rank={member.rank}
              name={member.name}
              pins={member.pins}
              percentile={member.percentile}
              movement={member.movement || 'none'}
              movementAmount={member.movementAmount}
              imageUrl={member.imageUrl}
              initials={member.initials}
            />
          ))}
        </section>

        {/* User Rank Card */}
        {userRank && (
          <section className="px-6 py-4 bg-white border-t border-gray-300 relative z-10">
            <div className="bg-black text-white p-4 border border-black flex items-center gap-4 rounded-lg">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 border border-white/30 overflow-hidden bg-gray-700">
                  {userRank.imageUrl ? (
                    <img
                      alt="User profile"
                      className="w-full h-full object-cover"
                      src={userRank.imageUrl}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[8px] font-black text-white">{userRank.initials}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -top-2 -right-2 bg-white text-black text-[8px] font-black px-1.5">
                  {userRank.rank}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-[8px] font-black tracking-[0.1em] uppercase">You / Rank {userRank.rank}</h3>
                  {userRank.percentile && <span className="text-[8px] font-black uppercase">{userRank.percentile}</span>}
                </div>
                <div className="w-full bg-white/20 h-1 mb-1">
                  <div className="bg-white w-2/3 h-full"></div>
                </div>
                <span className="text-[7px] font-bold text-white/50 uppercase tracking-widest">
                  {userRank.pins} PINS
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab="dashboard" />
      </div>
    </main>
  )
}
