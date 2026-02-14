'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', date: '' });
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      if (!response.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', date: '' });
        setShowForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
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
          <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-black">Manage Events</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Create Event'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 border-2 border-black rounded-lg mb-8">
            <h2 className="text-lg font-black uppercase tracking-widest text-black mb-6">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Event Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Event name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-black mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                Create Event
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {events.length === 0 ? (
            <div className="bg-white p-6 text-center border border-gray-300 rounded-lg text-gray-600">
              No events yet. Create one to get started!
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white p-6 border-2 border-black rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-black mb-1">{event.name}</h3>
                    <p className="text-sm text-gray-700">
                      {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-black">{event.participations?.length || 0}</div>
                    <p className="text-xs text-gray-700 uppercase tracking-widest">attendees</p>
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
