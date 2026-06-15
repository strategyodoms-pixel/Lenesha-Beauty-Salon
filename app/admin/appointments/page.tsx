'use client'

import { useEffect, useState } from 'react'

type Booking = {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  service: { name: string; durationMinutes: number }
  date: string
  timeSlot: string
  status: string
  isExpress: boolean
  depositPaid: boolean
  notes?: string | null
  inspirationPhotoUrls: string
}

function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(slot: string): string {
  const [h, mi] = slot.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(mi).padStart(2, '0')} ${period}`
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-600',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const params = statusFilter ? `?status=${statusFilter}` : ''
    const res = await fetch(`/api/bookings${params}`)
    const data = await res.json()
    setBookings(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter])

  async function updateStatus(id: string, status: string, extra: Record<string, string> = {}) {
    setSaving(true)
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extra }),
    })
    setSaving(false)
    load()
  }

  async function handleReschedule(id: string) {
    if (!newDate || !newTime) return
    setSaving(true)
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newDate, timeSlot: newTime }),
    })
    setSaving(false)
    setRescheduleId(null)
    setNewDate('')
    setNewTime('')
    load()
  }

  async function handleCancel(id: string) {
    setSaving(true)
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED', reason: cancelReason }),
    })
    setSaving(false)
    setCancelId(null)
    setCancelReason('')
    load()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-light text-text-dark">Appointments</h1>
          <p className="font-body text-text-dark/50 text-sm mt-1">{bookings.length} bookings</p>
        </div>
        <select
          className="input-field w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 font-body text-text-dark/40">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="font-body text-text-dark/40">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card p-6">
              <div className="flex flex-wrap gap-6 items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-body font-semibold text-text-dark">{b.clientName}</h3>
                    <span className={`font-body text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {b.status}
                    </span>
                    {b.isExpress && <span className="font-body text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">⚡ Express</span>}
                    {b.depositPaid && <span className="font-body text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Deposit Paid</span>}
                  </div>
                  <p className="font-body text-sm text-text-dark/70">{b.service.name} · {formatDate(b.date)} at {formatTime(b.timeSlot)}</p>
                  <p className="font-body text-xs text-text-dark/50 mt-1">{b.clientEmail} · {b.clientPhone}</p>
                  {b.notes && <p className="font-body text-xs text-text-dark/50 mt-1 italic">"{b.notes}"</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  {b.status === 'PENDING' && (
                    <button
                      onClick={() => updateStatus(b.id, 'CONFIRMED')}
                      disabled={saving}
                      className="btn-primary text-xs px-4 py-2"
                    >
                      Confirm
                    </button>
                  )}
                  {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                    <>
                      <button
                        onClick={() => { setRescheduleId(b.id); setNewDate(b.date); setNewTime(b.timeSlot) }}
                        className="btn-outline text-xs px-4 py-2"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setCancelId(b.id)}
                        className="font-body text-xs px-4 py-2 rounded-full border-2 border-red-200 text-red-400 hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateStatus(b.id, 'COMPLETED')}
                      disabled={saving}
                      className="font-body text-xs px-4 py-2 rounded-full border-2 border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Reschedule panel */}
              {rescheduleId === b.id && (
                <div className="mt-4 p-4 bg-secondary/20 rounded-xl space-y-3">
                  <h4 className="font-body font-semibold text-sm text-text-dark">Reschedule</h4>
                  <div className="flex gap-3">
                    <input type="date" className="input-field flex-1" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    <input type="time" className="input-field flex-1" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReschedule(b.id)} disabled={saving} className="btn-primary text-sm">
                      {saving ? 'Saving…' : 'Confirm Reschedule'}
                    </button>
                    <button onClick={() => setRescheduleId(null)} className="btn-outline text-sm">Cancel</button>
                  </div>
                </div>
              )}

              {/* Cancel panel */}
              {cancelId === b.id && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl space-y-3">
                  <h4 className="font-body font-semibold text-sm text-red-700">Cancel Appointment</h4>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Optional reason (sent to client)…"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleCancel(b.id)} disabled={saving} className="font-body font-semibold text-sm px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                      {saving ? 'Cancelling…' : 'Confirm Cancel'}
                    </button>
                    <button onClick={() => setCancelId(null)} className="btn-outline text-sm">Back</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
