'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PurchasesPage() {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ memberId: '', amount: '', note: '' });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [purchasesRes, membersRes] = await Promise.all([
        fetch('/api/admin/purchases'),
        fetch('/api/admin/members'),
      ]);

      if (!purchasesRes.ok || !membersRes.ok) {
        router.push('/admin/login');
        return;
      }

      const purchasesData = await purchasesRes.json();
      const membersData = await membersRes.json();

      setPurchases(purchasesData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: formData.memberId,
          amount: parseFloat(formData.amount),
          note: formData.note || null,
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setFormData({ memberId: '', amount: '', note: '' });
        setShowForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="grainy-bg"></div>
        <div className="relative z-10 text-black">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2]">
      <div className="grainy-bg"></div>

      <nav className="border-b border-black bg-[#F2F2F2] relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-sm font-black uppercase tracking-widest text-black hover:text-gray-700 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-black">Record Purchases</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Record Purchase'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 border-2 border-black rounded-lg mb-8">
            <h2 className="text-lg font-black uppercase tracking-widest text-black mb-6">Record New Purchase</h2>
            <form onSubmit={handleCreatePurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Member</label>
                <select
                  required
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.user?.name} ({member.memberNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Amount ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Note (optional)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Purchase note"
                />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                Record Purchase
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {purchases.length === 0 ? (
            <div className="bg-white p-6 text-center border border-gray-300 rounded-lg text-gray-600">
              No purchases recorded yet.
            </div>
          ) : (
            purchases.map((purchase) => (
              <div key={purchase.id} className="bg-white p-6 border-2 border-black rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-black">{purchase.member?.user?.name}</h3>
                    <p className="text-sm text-gray-700">
                      {new Date(purchase.date).toLocaleDateString()}
                    </p>
                    {purchase.note && <p className="text-sm text-gray-600 mt-1">{purchase.note}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-black">${purchase.amount}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
