'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Check if user is admin
      if (data.role?.toUpperCase() !== 'ADMIN') {
        setError('Admin access required');
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              Admin Login
            </span>
          </div>
        </header>

        {/* Login Form */}
        <section className="px-6 py-4 flex-1 relative z-10">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-black mb-3">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-black text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="admin@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-black mb-3">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-black text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-600 transition-colors mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-300">
            <p className="text-xs font-bold text-black mb-3 uppercase tracking-widest">Demo Credentials:</p>
            <div className="bg-white rounded-lg p-3 space-y-2 text-xs text-gray-600 font-mono border border-gray-200">
              <div><span className="text-black font-bold">Email:</span> admin@delta-fraternite.com</div>
              <div><span className="text-black font-bold">Password:</span> admin123</div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block text-black font-bold text-xs uppercase tracking-widest hover:text-gray-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
