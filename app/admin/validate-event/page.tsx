'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Event {
  id: string
  name: string
  date: string
  participations: Array<{ id: string; memberId: string }>
}

interface Member {
  id: string
  memberNumber: string
  user: {
    name: string
    email: string
  }
}

interface Participant {
  id: string
  memberId: string
  checkinDate: string
  member: Member
}

export default function ValidateEventParticipationPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      fetchParticipants(selectedEvent)
    }
  }, [selectedEvent])

  const fetchInitialData = async () => {
    try {
      const [eventsRes, membersRes] = await Promise.all([
        fetch('/api/admin/events'),
        fetch('/api/admin/members'),
      ])

      if (!eventsRes.ok || !membersRes.ok) {
        router.push('/admin/login')
        return
      }

      const eventsData = await eventsRes.json()
      const membersData = await membersRes.json()

      setEvents(eventsData)
      setMembers(membersData)

      // Auto-select first event
      if (eventsData.length > 0) {
        setSelectedEvent(eventsData[0].id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipants = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/events/validate-participation?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data)
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }

  const handleAddParticipant = async (memberId: string) => {
    setIsAdding(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/admin/events/validate-participation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          eventId: selectedEvent,
        }),
      })

      if (response.ok) {
        setSuccessMessage('✅ Participation validated!')
        setSearchTerm('')
        fetchParticipants(selectedEvent)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const error = await response.json()
        setErrorMessage(error.error || 'Error adding participation')
      }
    } catch (error) {
      console.error('Error adding participation:', error)
      setErrorMessage('Error adding participation')
    } finally {
      setIsAdding(false)
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      (member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.memberNumber.includes(searchTerm)) &&
      !participants.some((p) => p.memberId === member.id)
  )

  const currentEvent = events.find((e) => e.id === selectedEvent)

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

      <nav className="border-b border-black bg-[#F2F2F2] relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-sm font-black uppercase tracking-widest text-black hover:text-gray-700 transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-xl font-black uppercase tracking-[0.3em] text-black">Validate Event Participation</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Events List */}
          <div>
            <h2 className="text-lg font-black uppercase tracking-widest text-black mb-4">📅 Events</h2>
            <div className="space-y-2">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className={`w-full text-left p-4 rounded border-2 transition-all ${
                    selectedEvent === event.id
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-gray-300 text-black hover:border-black'
                  }`}
                >
                  <div className="font-black uppercase tracking-tight text-sm">{event.name}</div>
                  <div className={`text-xs mt-1 ${ selectedEvent === event.id ? 'text-gray-200' : 'text-gray-700'}`}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className={`text-xs mt-2 font-bold ${ selectedEvent === event.id ? 'text-gray-300' : 'text-gray-600'}`}>
                    {event.participations.length} participant{event.participations.length !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Add Participants & Current Participants */}
          <div className="lg:col-span-2">
            {currentEvent ? (
              <div className="space-y-6">
                {/* Current Event Info */}
                <div className="bg-white p-6 border-2 border-black rounded-lg">
                  <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">{currentEvent.name}</h2>
                  <p className="text-gray-700 text-sm">
                    {new Date(currentEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Add Participant Form */}
                <div className="bg-white p-6 border-2 border-black rounded-lg">
                  <h3 className="text-lg font-black text-black mb-4 uppercase tracking-widest">➕ Add Participant</h3>

                  {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4 text-sm">
                      {successMessage}
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Search member by name, email, or member number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-black mb-4"
                    disabled={isAdding}
                  />

                  {searchTerm && filteredMembers.length > 0 ? (
                    <div className="space-y-2">
                      {filteredMembers.slice(0, 10).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-[#F2F2F2] rounded border border-gray-300 hover:border-black transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-black truncate text-sm">{member.user.name}</div>
                            <div className="text-xs text-gray-700 truncate">{member.memberNumber}</div>
                            <div className="text-xs text-gray-600 truncate">{member.user.email}</div>
                          </div>
                          <button
                            onClick={() => handleAddParticipant(member.id)}
                            disabled={isAdding}
                            className="px-3 py-1 bg-black text-white font-black text-xs uppercase tracking-widest ml-3 whitespace-nowrap hover:bg-gray-800 transition-colors"
                          >
                            {isAdding ? '...' : 'Add'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : searchTerm ? (
                    <div className="text-gray-700 text-sm text-center py-4">No members found</div>
                  ) : (
                    <div className="text-gray-600 text-sm text-center py-4">Type to search members...</div>
                  )}
                </div>

                {/* Current Participants */}
                <div className="bg-white p-6 border-2 border-black rounded-lg">
                  <h3 className="text-lg font-black text-black mb-4 uppercase tracking-widest">
                    👥 Participants ({participants.length})
                  </h3>

                  {participants.length > 0 ? (
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-3 bg-[#F2F2F2] rounded border border-gray-300"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-black truncate text-sm">
                              {participant.member.user.name}
                            </div>
                            <div className="text-xs text-gray-700 truncate">
                              {participant.member.memberNumber}
                            </div>
                            <div className="text-xs text-gray-600">
                              Checked in:{' '}
                              {new Date(participant.checkinDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <span className="text-green-700 font-black ml-3">✅</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm text-center py-4">No participants yet</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 text-center border-2 border-black rounded-lg">
                <p className="text-gray-700">Select an event to add participants</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
