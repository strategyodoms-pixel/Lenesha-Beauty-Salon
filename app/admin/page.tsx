import { prisma } from '@/lib/prisma'
import Link from 'next/link'

function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

export default async function AdminDashboard() {
  const today = new Date()
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const todayStr = today.toISOString().split('T')[0]

  const [monthlyBookings, pendingCount, expressCount, recentBookings, uniqueClients] = await Promise.all([
    prisma.booking.findMany({
      where: { date: { startsWith: thisMonth }, status: { not: 'CANCELLED' } },
      include: { service: true },
    }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { isExpress: true, date: { startsWith: thisMonth } } }),
    prisma.booking.findMany({
      where: { date: { gte: todayStr } },
      include: { service: true },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
      take: 10,
    }),
    prisma.booking.groupBy({ by: ['clientEmail'], where: { status: { not: 'CANCELLED' } } }),
  ])

  const monthRevenue = monthlyBookings.reduce((sum, b) => sum + b.service.price - (b.discountAmount ?? 0), 0)

  const stats = [
    { label: 'Bookings This Month', value: monthlyBookings.length, icon: '📅', color: 'bg-blue-50' },
    { label: 'Pending Approval', value: pendingCount, icon: '⏳', color: 'bg-yellow-50' },
    { label: 'Monthly Revenue', value: `$${monthRevenue.toFixed(0)}`, icon: '💰', color: 'bg-green-50' },
    { label: 'Express Bookings', value: expressCount, icon: '⚡', color: 'bg-orange-50' },
    { label: 'Total Clients', value: uniqueClients.length, icon: '👥', color: 'bg-purple-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-light text-text-dark">Dashboard</h1>
        <p className="font-body text-text-dark/50 mt-1 text-sm">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`card p-6 ${s.color}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="font-heading text-3xl font-light text-text-dark">{s.value}</p>
            <p className="font-body text-xs text-text-dark/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          ['📅', 'Appointments', '/admin/appointments'],
          ['✂️', 'Services', '/admin/services'],
          ['⭐', 'Testimonials', '/admin/testimonials'],
          ['⚙️', 'Settings', '/admin/settings'],
        ].map(([icon, label, href]) => (
          <Link
            key={href}
            href={href}
            className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">{icon}</span>
            <span className="font-body font-semibold text-sm text-text-dark">{label}</span>
          </Link>
        ))}
      </div>

      {/* Export clients */}
      <div className="mb-8 flex justify-between items-center">
        <h2 className="font-heading text-2xl font-light text-text-dark">Upcoming Appointments</h2>
        <a
          href="/api/admin/clients/export"
          download
          className="btn-outline text-sm"
        >
          📥 Export Client List
        </a>
      </div>

      {/* Recent appointments table */}
      <div className="card overflow-hidden">
        {recentBookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-body text-text-dark/40">No upcoming appointments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary/30 bg-background">
                  {['Client', 'Service', 'Date', 'Time', 'Status', 'Express'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 font-body text-xs font-semibold text-text-dark/50 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/20">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-body font-semibold text-sm text-text-dark">{b.clientName}</p>
                      <p className="font-body text-xs text-text-dark/50">{b.clientEmail}</p>
                    </td>
                    <td className="px-6 py-4 font-body text-sm text-text-dark">{b.service.name}</td>
                    <td className="px-6 py-4 font-body text-sm text-text-dark">{formatDate(b.date)}</td>
                    <td className="px-6 py-4 font-body text-sm text-text-dark">{formatTime(b.timeSlot)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-body text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-body text-sm">{b.isExpress ? '⚡' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 text-right">
        <Link href="/admin/appointments" className="font-body text-sm text-cta hover:underline">
          View all appointments →
        </Link>
      </div>
    </div>
  )
}
