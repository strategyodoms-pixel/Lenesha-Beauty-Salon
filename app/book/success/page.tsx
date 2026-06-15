import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Booking Confirmed!' }

function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatTime(slot: string): string {
  const [h, mi] = slot.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(mi).padStart(2, '0')} ${period}`
}

export default async function BookingSuccessPage({ searchParams }: { searchParams: { bookingId?: string } }) {
  const { bookingId } = searchParams

  if (!bookingId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-body text-text-dark/50 mb-6">No booking found.</p>
          <Link href="/book" className="btn-primary">Book an Appointment</Link>
        </div>
      </main>
    )
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  })

  if (!booking) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-body text-text-dark/50 mb-6">Booking not found.</p>
          <Link href="/book" className="btn-primary">Book an Appointment</Link>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-24"
      style={{ background: 'linear-gradient(135deg, #FDF6F0 0%, #F5E6D8 100%)' }}
    >
      <div className="max-w-lg w-full card p-10 text-center">
        <div className="text-6xl mb-6">✨</div>

        <p className="font-body text-sm tracking-[0.3em] uppercase text-cta mb-3">You're all set!</p>
        <h1 className="font-heading text-4xl font-light text-text-dark mb-4">
          Booking Confirmed
        </h1>
        <p className="font-body text-text-dark/60 mb-8">
          A confirmation email has been sent to <strong>{booking.clientEmail}</strong>. We can't wait to see you!
        </p>

        <div className="space-y-4 text-left bg-background rounded-2xl p-6 mb-8">
          <div className="flex justify-between font-body text-sm">
            <span className="text-text-dark/60">Service</span>
            <span className="font-semibold text-text-dark">{booking.service.name}{booking.isExpress ? ' ⚡' : ''}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-text-dark/60">Date</span>
            <span className="font-semibold text-text-dark">{formatDate(booking.date)}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-text-dark/60">Time</span>
            <span className="font-semibold text-text-dark">{formatTime(booking.timeSlot)}</span>
          </div>
          {booking.depositPaid && (
            <div className="flex justify-between font-body text-sm">
              <span className="text-text-dark/60">Deposit paid</span>
              <span className="font-semibold text-green-600">${booking.depositAmount?.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link href="/services" className="btn-primary w-full block text-center">
            Explore Other Services
          </Link>
          <Link href="/" className="btn-outline w-full block text-center">
            Return Home
          </Link>
        </div>
      </div>
    </main>
  )
}
