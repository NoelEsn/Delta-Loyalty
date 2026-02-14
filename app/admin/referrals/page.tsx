'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    referrerId: '',
    referredMemberId: '',
    date: new Date().toISOString().split('T')[0],
    adminNote: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [referralsRes, membersRes] = await Promise.all([
        fetch('/api/admin/referrals'),
        fetch('/api/admin/members'),
      ]);

      if (!referralsRes.ok || !membersRes.ok) {
        router.push('/admin/login');
        return;
      }

      const referralsData = await referralsRes.json();
      const membersData = await membersRes.json();

      setReferrals(referralsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation
    if (formData.referrerId === formData.referredMemberId) {
      setError('A member cannot refer themselves');
      return;
    }

    try {
      const response = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrerId: formData.referrerId,
          referredMemberId: formData.referredMemberId,
          date: formData.date,
          adminNote: formData.adminNote || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create referral');
        return;
      }

      setSuccess('Referral created successfully!');
      setFormData({
        referrerId: '',
        referredMemberId: '',
        date: new Date().toISOString().split('T')[0],
        adminNote: '',
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      setError('An error occurred');
      console.error('Error creating referral:', error);
    }
  };

  const handleDeleteReferral = async (referralId: string) => {
    if (!confirm('Delete this referral? This will affect the referrer\'s ranking.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/referrals/${referralId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setError('Failed to delete referral');
        return;
      }

      setSuccess('Referral deleted successfully');
      fetchData();
    } catch (error) {
      setError('An error occurred');
      console.error('Error deleting referral:', error);
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
          <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-black">Referrals Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Create Referral'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 border-2 border-black rounded-lg mb-8">
            <h2 className="text-lg font-black uppercase tracking-widest text-black mb-6">Create New Referral</h2>
            <form onSubmit={handleCreateReferral} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">
                    Parrain (Referrer)
                  </label>
                  <select
                    required
                    value={formData.referrerId}
                    onChange={(e) =>
                      setFormData({ ...formData, referrerId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select referrer...</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.user?.name} ({member.memberNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">
                    Parrainé (Referred)
                  </label>
                  <select
                    required
                    value={formData.referredMemberId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referredMemberId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select referred member...</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.user?.name} ({member.memberNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">
                    Admin Note (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.adminNote}
                    onChange={(e) =>
                      setFormData({ ...formData, adminNote: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Optional note..."
                  />
                </div>
              </div>

              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded text-sm">
                ⚠️ A member cannot refer themselves
              </div>

              <button type="submit" className="w-full bg-black text-white py-2 font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                Create Referral
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {referrals.length === 0 ? (
            <div className="bg-white p-6 text-center border border-gray-300 rounded-lg text-gray-600">
              No referrals yet. Create one to get started!
            </div>
          ) : (
            <div className="bg-white border-2 border-black rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F2F2F2] border-b border-black">
                    <tr>
                      <th className="px-4 py-3 text-left text-black font-black tracking-widest uppercase text-xs">
                        Referrer
                      </th>
                      <th className="px-4 py-3 text-left text-black font-black tracking-widest uppercase text-xs">
                        Referred
                      </th>
                      <th className="px-4 py-3 text-left text-black font-black tracking-widest uppercase text-xs">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-black font-black tracking-widest uppercase text-xs">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-black font-black tracking-widest uppercase text-xs">
                        Note
                      </th>
                      <th className="px-4 py-3 text-right text-black font-black tracking-widest uppercase text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {referrals.map((referral) => (
                      <tr
                        key={referral.id}
                        className="hover:bg-[#F2F2F2] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="text-black font-bold text-sm">
                            {referral.referrer.user?.name}
                          </div>
                          <div className="text-gray-600 text-xs">
                            {referral.referrer.memberNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-black font-bold text-sm">
                            {referral.referredMember.user?.name}
                          </div>
                          <div className="text-gray-600 text-xs">
                            {referral.referredMember.memberNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-sm">
                          {new Date(referral.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${
                              referral.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {referral.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-sm">
                          {referral.adminNote || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteReferral(referral.id)}
                            className="text-red-700 hover:text-red-900 transition-colors text-sm font-bold uppercase tracking-widest"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-[#F2F2F2] border-t border-black text-sm text-gray-700 font-bold">
                Total: {referrals.length} referrals
              </div>
            </div>
          )}
        </div>

        {/* Stats by member */}
        <div className="mt-12">
          <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-black mb-6">Referral Stats by Member</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members
              .filter((member) => {
                const count = referrals.filter(
                  (r) => r.referrerId === member.id
                ).length;
                return count > 0;
              })
              .map((member) => {
                const count = referrals.filter(
                  (r) => r.referrerId === member.id
                ).length;
                return (
                  <div key={member.id} className="bg-white p-6 border-2 border-black rounded-lg">
                    <h3 className="text-lg font-black text-black">
                      {member.user?.name}
                    </h3>
                    <p className="text-gray-700 text-sm mb-3">
                      {member.memberNumber}
                    </p>
                    <div className="bg-[#F2F2F2] p-3 rounded border border-gray-300">
                      <div className="text-3xl font-black text-black">
                        {count}
                      </div>
                      <div className="text-gray-700 text-sm uppercase tracking-widest font-bold">
                        referral{count > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </main>
  );
}
