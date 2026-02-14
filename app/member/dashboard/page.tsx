'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MemberCard from '@/components/MemberCard'
import ProgressBar from '@/components/ProgressBar'
import PinGrid from '@/components/PinGrid'
import BottomNav from '@/components/BottomNav'
import { getProgressPercent, getCurrentLevel, getProgressDescription, getNextLevelThreshold } from '@/lib/progressHelpers'
import { PROGRESS_THRESHOLDS } from '@/lib/progressConfig'

interface PinConfig {
  icon?: string
  label: string
  metallic: 'bronze' | 'silver' | 'gold' | 'diamond'
  unlocked: boolean
  imageUrl?: string
}

export default function MemberDashboard() {
  const [loading, setLoading] = useState(true)
  const [memberData, setMemberData] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const authResponse = await fetch('/api/auth/me')
        if (authResponse.ok) {
          const session = await authResponse.json()
          setIsAdmin(session.role?.toUpperCase() === 'ADMIN')
        }

        const response = await fetch('/api/member/metrics')
        if (!response.ok) {
          router.push('/login')
          return
        }
        const data = await response.json()
        setMemberData(data)
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </main>
    )
  }

  if (!memberData) {
    return null
  }

  // Determine tier status
  const clientLevel = getCurrentLevel(memberData.totalSpent || 0, PROGRESS_THRESHOLDS.find(t => t.id === 'spending')!);
  const eventLevel = getCurrentLevel(memberData.eventsCount || 0, PROGRESS_THRESHOLDS.find(t => t.id === 'events')!);
  const ambassadorLevel = getCurrentLevel(memberData.referralsCount || 0, PROGRESS_THRESHOLDS.find(t => t.id === 'referrals')!);

  const tierStatus = memberData.isDiamondEligible ? 'Diamond' : clientLevel === 3 ? 'Platinum' : clientLevel === 2 ? 'Gold' : 'Silver'

  // Build pins array with correct values
  const pins: PinConfig[] = [
    // Spending (clients)
    { icon: 'workspace_premium', label: 'Genesis', metallic: 'bronze', unlocked: clientLevel >= 1, imageUrl: '/badges/clients/badge-client-bronze.jpg' },
    { icon: 'shopping_bag', label: 'Collector', metallic: 'silver', unlocked: clientLevel >= 2, imageUrl: '/badges/clients/badge-client-argent.jpg' },
    { icon: 'bolt', label: 'Speed', metallic: 'gold', unlocked: clientLevel >= 3, imageUrl: '/badges/clients/badge-client-or.jpg' },

    // Events
    { icon: 'local_fire_department', label: 'Streak', metallic: 'bronze', unlocked: eventLevel >= 1, imageUrl: '/badges/events/badge-event-bronze.jpg' },
    { icon: 'location_on', label: 'Nomad', metallic: 'silver', unlocked: eventLevel >= 2, imageUrl: '/badges/events/badge-event-argent.jpg' },
    { icon: 'crown', label: 'Architect', metallic: 'gold', unlocked: eventLevel >= 3, imageUrl: '/badges/events/badge-event-or.jpg' },

    // Referrals
    { icon: 'groups', label: 'Alliance', metallic: 'bronze', unlocked: ambassadorLevel >= 1, imageUrl: '/badges/referrals/badge-referral-bronze.jpg' },
    { icon: 'star', label: 'Veteran', metallic: 'silver', unlocked: ambassadorLevel >= 2, imageUrl: '/badges/referrals/badge-referral-argent.jpg' },
    { icon: 'diamond', label: 'Curator', metallic: 'gold', unlocked: ambassadorLevel >= 3, imageUrl: '/badges/referrals/badge-referral-or.jpg' },

    // Diamant (toujours à la fin)
    { icon: 'diamond', label: 'Diamond', metallic: 'diamond', unlocked: memberData.isDiamondEligible, imageUrl: '/badges/diamant/badge-diamant.jpg' },
  ]

  // Get badges for the member card from the same pins - ensures consistency
  const standardBadges = pins.slice(0, 9).map(pin => ({
    icon: pin.icon!,
    metallic: pin.metallic as 'bronze' | 'silver' | 'gold',
    unlocked: pin.unlocked,
    imageUrl: pin.imageUrl
  }))

  // Badge diamant : image dédiée
  const diamondBadge = {
    icon: 'diamond',
    metallic: 'diamond' as const,
    unlocked: memberData.isDiamondEligible,
    imageUrl: '/badges/diamant/badge-diamant.jpg'
  }


  const spendingVertical = PROGRESS_THRESHOLDS.find(t => t.id === 'spending')!
  const eventsVertical = PROGRESS_THRESHOLDS.find(t => t.id === 'events')!
  const referralsVertical = PROGRESS_THRESHOLDS.find(t => t.id === 'referrals')!

  const spendingProgress = getProgressPercent(memberData.totalSpent || 0, spendingVertical)
  const eventsProgress = getProgressPercent(memberData.eventsCount || 0, eventsVertical)
  const referralsProgress = getProgressPercent(memberData.referralsCount || 0, referralsVertical)

  // Get descriptions for progress bars
  const spendingDescription = getProgressDescription(memberData.totalSpent || 0, spendingVertical)
  const eventsDescription = getProgressDescription(memberData.eventsCount || 0, eventsVertical)
  const referralsDescription = getProgressDescription(memberData.referralsCount || 0, referralsVertical)

  // Get the next level thresholds for max display
  const spendingMax = getNextLevelThreshold(memberData.totalSpent || 0, spendingVertical)
  const eventsMax = getNextLevelThreshold(memberData.eventsCount || 0, eventsVertical)
  const referralsMax = getNextLevelThreshold(memberData.referralsCount || 0, referralsVertical)

  // Calculate drop attendance and engagement metrics
  const dropAttendance = Math.min(memberData.eventsCount || 0, 10) // Max 10
  const engagement = Math.round(
    ((memberData.eventsCount || 0) * 0.3 + (memberData.referralsCount || 0) * 0.3 + (memberData.totalSpent || 0) * 0.4) / 100 * 100
  )

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
              Member Dashboard
            </span>
          </div>
        </header>

        {/* Member Card */}
        <section className="px-6 py-4 relative z-10">
          <MemberCard
            tierStatus={tierStatus}
            memberName={memberData.memberName || 'Team Member'}
            memberId={memberData.memberNumber || 'DF-0000-0000'}
            standardBadges={standardBadges}
            diamondBadge={diamondBadge}
          />
        </section>

        {/* Progress Metrics Section */}
        <section className="px-6 py-4 space-y-6 relative z-10">
          <div className="grid grid-cols-1 gap-4">
            <ProgressBar
              label="Achats"
              value={memberData.totalSpent || 0}
              percentage={spendingProgress}
              max={spendingMax}
              showValue={true}
              description={spendingDescription}
            />
            <ProgressBar
              label="Participation aux événements"
              value={memberData.eventsCount || 0}
              percentage={eventsProgress}
              max={eventsMax}
              showValue={true}
              description={eventsDescription}
            />
            <ProgressBar
              label="Parrainages"
              value={memberData.referralsCount || 0}
              percentage={referralsProgress}
              max={referralsMax}
              showValue={true}
              description={referralsDescription}
            />
          </div>
        </section>

        {/* Full Collection */}
        <section className="px-6 pt-6 pb-32 flex-grow relative z-10">
          <PinGrid
            pins={pins}
            totalPins={pins.length}
            isDiamondLocked={!memberData.isDiamondEligible}
          />
        </section>

        {/* Bottom Navigation */}
        <BottomNav activeTab="dashboard" />

        {/* Admin Link */}
        {isAdmin && (
          <div className="fixed top-6 right-6 z-40">
            <Link
              href="/admin/dashboard"
              className="text-xs font-bold uppercase tracking-widest px-3 py-2 border border-black bg-black text-white hover:bg-gray-900 transition-colors"
            >
              → Admin
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
