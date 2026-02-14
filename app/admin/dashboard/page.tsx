'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [memberCount, setMemberCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Verify admin session and load stats
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          router.push('/admin/login')
          return
        }
        const data = await response.json()
        setStats(data)
        setMemberCount(data.totalMembers || 0)
      } catch (error) {
        router.push('/admin/login')
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
        <div className="grainy-bg"></div>
        <div className="relative z-10 text-black">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2]">
      <div className="grainy-bg"></div>
      
      {/* Header */}
      <nav className="border-b border-black bg-[#F2F2F2] relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex flex-col items-start">
            <h1 className="text-3xl font-black tracking-[0.3em] uppercase text-black">
              Admin Portal
            </h1>
            <span className="text-[10px] uppercase tracking-[0.5em] text-black font-bold mt-1">
              Dashboard
            </span>
          </div>
          <div className="space-x-6 flex items-center">
            <Link href="/member/dashboard" className="text-xs font-black uppercase tracking-widest text-black/60 hover:text-black transition-colors">
              → Member View
            </Link>
            <button onClick={handleLogout} className="text-xs font-black uppercase tracking-widest px-3 py-2 border border-black hover:bg-black hover:text-white transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 border-2 border-black rounded-lg">
            <div className="text-[9px] uppercase tracking-widest font-black text-black/60 mb-3">Total Members</div>
            <div className="text-4xl font-black tracking-tight text-black">{memberCount}</div>
          </div>
          <div className="bg-white p-6 border-2 border-black rounded-lg">
            <div className="text-[9px] uppercase tracking-widest font-black text-black/60 mb-3">Diamond Members</div>
            <div className="text-4xl font-black tracking-tight text-black">{stats?.diamondMembers || 0}</div>
          </div>
          <div className="bg-white p-6 border-2 border-black rounded-lg">
            <div className="text-[9px] uppercase tracking-widest font-black text-black/60 mb-3">Total Revenue</div>
            <div className="text-4xl font-black tracking-tight text-black">${(stats?.totalRevenue || 0).toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 border-2 border-black rounded-lg">
            <div className="text-[9px] uppercase tracking-widest font-black text-black/60 mb-3">Events This Month</div>
            <div className="text-4xl font-black tracking-tight text-black">{stats?.eventsThisMonth || 0}</div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 border-2 border-black rounded-lg">
            <h3 className="text-[14px] font-black uppercase tracking-widest mb-6 border-b border-black pb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/admin/members">
                <button className="w-full text-left px-4 py-3 border border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                  Manage Members
                </button>
              </Link>
              <Link href="/admin/events">
                <button className="w-full text-left px-4 py-3 border border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                  Events & Check-ins
                </button>
              </Link>
              <Link href="/admin/purchases">
                <button className="w-full text-left px-4 py-3 border border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                  Record Purchases
                </button>
              </Link>
              <Link href="/admin/referrals">
                <button className="w-full text-left px-4 py-3 border border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                  Referral Management
                </button>
              </Link>
              <Link href="/admin/validate-event">
                <button className="w-full text-left px-4 py-3 border border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                  Validate Event Participation
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 border-2 border-black rounded-lg">
            <h3 className="text-[14px] font-black uppercase tracking-widest mb-6 border-b border-black pb-4">
              System Info
            </h3>
            <div className="space-y-4 text-[11px] font-mono">
              <div>
                <span className="text-black/60">Version:</span>
                <span className="ml-2 font-black">1.0.0</span>
              </div>
              <div>
                <span className="text-black/60">Members:</span>
                <span className="ml-2 font-black">{memberCount}</span>
              </div>
              <div>
                <span className="text-black/60">Status:</span>
                <span className="ml-2 font-black">● Operational</span>
              </div>
              <div>
                <span className="text-black/60">Last Updated:</span>
                <span className="ml-2 font-black">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
