'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TabNav from '@/components/TabNav'
import HallOfFameCard from '@/components/HallOfFameCard'
import BottomNav from '@/components/BottomNav'

interface HallOfFameMember {
  id: string
  name: string
  memberNumber: string
  pins: number
  imageUrl: string
  since?: string
  title?: string
  featured?: boolean
}

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'legacy', label: 'Legacy' },
  { id: 'archived', label: 'Archived' },
  { id: 'founders', label: 'Founders' },
]

export default function HallOfFamePage() {
  const [loading, setLoading] = useState(true)
  const [enabled, setEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [members, setMembers] = useState<HallOfFameMember[]>([])
  const [featured, setFeatured] = useState<HallOfFameMember | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchHallOfFame = async () => {
      try {
        const response = await fetch(`/api/member/hall-of-fame?filter=${activeTab}`)
        if (response.status === 404) {
          // Hall of Fame not enabled
          setEnabled(false)
          return
        }
        if (!response.ok) {
          router.push('/login')
          return
        }
        const data = await response.json()
        setEnabled(data.enabled !== false)
        setMembers(data.members || [])
        setFeatured(data.featured || null)
      } catch (error) {
        console.error('Failed to fetch hall of fame:', error)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchHallOfFame()
  }, [activeTab, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="grainy-bg"></div>
        <div className="relative z-10 text-black">Loading...</div>
      </main>
    )
  }

  if (!enabled) {
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
                Hall of Fame
              </span>
            </div>
          </header>

          {/* Empty State */}
          <section className="px-6 py-12 flex-1 flex flex-col items-center justify-center text-center relative z-10">
            <p className="text-xs text-gray-600 mb-4 uppercase tracking-widest font-bold">
              Coming Soon
            </p>
            <p className="text-sm text-gray-700 mb-8">
              The Hall of Fame will open when the first members reach Diamond status.
            </p>
            <Link
              href="/member/dashboard"
              className="inline-block px-4 py-2 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors"
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
              Hall of Fame
            </span>
          </div>
        </header>

        {/* Tab Navigation */}
        <section className="px-6 py-4 relative z-10">
          <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </section>

        {/* Main Content */}
        <section className="px-6 py-4 space-y-8 flex-1 relative z-10">
          {/* Featured Member */}
          {featured && (
            <HallOfFameCard
              variant="featured"
              name={featured.name}
              title={featured.title || `Member #${featured.memberNumber}`}
              imageUrl={featured.imageUrl}
              since={featured.since}
            />
          )}

          {/* Grid of Members */}
          {members.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {members.map((member) => (
                <HallOfFameCard
                  key={member.id}
                  variant="grid"
                  name={member.name}
                  imageUrl={member.imageUrl}
                  pins={member.pins}
                />
              ))}
            </div>
          )}

          {/* No Members Message */}
          {members.length === 0 && !featured && (
            <div className="text-center py-8">
              <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">
                No members to display
              </p>
            </div>
          )}

          {/* End of Selection */}
          <div className="pt-6 pb-2 text-center border-t border-gray-300">
            <p className="text-xs font-black uppercase tracking-[0.5em] text-black">
              End of Selection
            </p>
          </div>
        </section>

        {/* Bottom Navigation */}
        <BottomNav activeTab="dashboard" />
      </div>
    </main>
  )
}
