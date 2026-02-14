'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MembersPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const router = useRouter();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/members');
      if (!response.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', email: '', password: '' });
        setShowForm(false);
        fetchMembers();
      }
    } catch (error) {
      console.error('Error creating member:', error);
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
          <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-black">Manage Members</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Member'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 border-2 border-black rounded-lg mb-8">
            <h2 className="text-lg font-black uppercase tracking-widest text-black mb-6">Create New Member</h2>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Member name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="member@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                Create Member
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {members.length === 0 ? (
            <div className="bg-white p-6 text-center border border-gray-300 rounded-lg text-gray-600">
              No members yet. Create one to get started!
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="bg-white p-6 border-2 border-black rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-black mb-1">{member.user?.name}</h3>
                    <p className="text-sm text-gray-700">{member.user?.email}</p>
                    <p className="text-xs font-bold text-black mt-2 uppercase tracking-widest">{member.memberNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-black">{member.totalPins || 0}</div>
                    <p className="text-xs text-gray-700 uppercase tracking-widest">pins</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-[#F2F2F2] p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-700">Spent</p>
                    <p className="font-black text-black">${member.totalSpent || 0}</p>
                  </div>
                  <div className="bg-[#F2F2F2] p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-700">Events</p>
                    <p className="font-black text-black">{member.eventsCount || 0}</p>
                  </div>
                  <div className="bg-[#F2F2F2] p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-700">Referrals</p>
                    <p className="font-black text-black">{member.referralsCount || 0}</p>
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
