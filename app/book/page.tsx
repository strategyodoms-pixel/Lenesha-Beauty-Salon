import { Suspense } from 'react'
import BookingForm from '@/components/BookingForm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Book an Appointment' }

export default function BookPage() {
  return (
    <main className="min-h-screen">
      <section
        className="py-24 px-6"
        style={{ background: 'linear-gradient(180deg, #F5E6D8 0%, #FDF6F0 100%)' }}
      >
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-cta mb-4">Reserve Your Chair</p>
          <h1 className="section-heading">Book an Appointment</h1>
          <p className="font-body text-text-dark/60 mt-4 leading-relaxed">
            Follow the steps below to book your next appointment. You'll receive a confirmation email once your booking is complete.
          </p>
        </div>

        <Suspense fallback={<div className="text-center font-body text-text-dark/40 py-12">Loading booking form…</div>}>
          <BookingForm isExpress={false} />
        </Suspense>

        <div className="text-center mt-12">
          <Link href="/" className="font-body text-sm text-text-dark/50 hover:text-cta transition-colors">← Back to Home</Link>
        </div>
      </section>
    </main>
  )
}
