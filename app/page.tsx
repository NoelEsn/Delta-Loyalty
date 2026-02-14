import Link from 'next/link'

export default function Home() {
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
              Welcome
            </span>
          </div>
        </header>

        {/* Main Content */}
        <section className="px-6 py-4 flex-1 flex flex-col justify-center gap-6 relative z-10">
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-4">
              Premium Gamified Membership System
            </p>
            <p className="text-xs text-gray-600 mb-8 leading-relaxed">
              Collect exclusive pins through spending, events, and referrals.
            </p>
          </div>

          {/* Features Cards */}
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                <span className="text-2xl">💰</span>
                <div>
                  <h3 className="text-xs font-black tracking-widest uppercase text-black">Spending</h3>
                  <p className="text-xs text-gray-600 mt-1">Earn pins through purchases</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="text-xs font-black tracking-widest uppercase text-black">Events</h3>
                  <p className="text-xs text-gray-600 mt-1">Join exclusive events</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                <span className="text-2xl">🌟</span>
                <div>
                  <h3 className="text-xs font-black tracking-widest uppercase text-black">Referrals</h3>
                  <p className="text-xs text-gray-600 mt-1">Invite friends & earn</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Buttons */}
        <section className="px-6 py-4 space-y-3 relative z-10">
          <Link
            href="/login"
            className="block w-full bg-black text-white text-center py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Member Login
          </Link>
          <Link
            href="/admin/login"
            className="block w-full bg-white text-black text-center py-3 rounded-lg font-bold text-sm uppercase tracking-widest border border-black hover:bg-gray-100 transition-colors"
          >
            Admin Portal
          </Link>
        </section>
      </div>
    </main>
  )
}
