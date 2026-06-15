import { Suspense } from 'react'
import BookingForm from '@/components/BookingForm'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '⚡ Express Booking' }

export default async function ExpressPage() {
  const settings = await prisma.siteSettings.findFirst()
  const upcharge = settings?.expressUpcharge ?? 20
  const upchargeType = settings?.expressUpchargeType ?? 'FLAT'
  const upchargeLabel = upchargeType === 'PERCENT' ? `${upcharge}%` : `$${upcharge}`

  return (
    <main className="min-h-screen">
      {/* Express hero */}
      <section
        className="py-24 px-6 text-center text-white"
        style={{ background: 'linear-gradient(135deg, #B07D6C, #C9A99A)' }}
      >
        <div className="text-6xl mb-4">⚡</div>
        <p className="font-body text-sm tracking-[0.3em] uppercase text-white/70 mb-4">Priority Service</p>
        <h1 className="font-heading text-5xl md:text-7xl font-light mb-4">
          Express Booking
        </h1>
        <p className="font-body text-white/80 text-lg max-w-xl mx-auto leading-relaxed mb-6">
          Get first access to the best available time slots. Perfect when you need your appointment sooner.
        </p>
        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-6 py-2">
          <span className="font-body text-sm font-semibold text-white">
            Just {upchargeLabel} more — priority slots highlighted below
          </span>
        </div>
      </section>

      {/* Booking form */}
      <section
        className="py-24 px-6"
        style={{ background: 'linear-gradient(180deg, #F5E6D8 0%, #FDF6F0 100%)' }}
      >
        <Suspense fallback={<div className="text-center font-body text-text-dark/40 py-12">Loading…</div>}>
          <BookingForm isExpress={true} />
        </Suspense>

        <div className="text-center mt-12">
          <Link href="/book" className="font-body text-sm text-text-dark/50 hover:text-cta transition-colors">
            Prefer regular booking? Book here →
          </Link>
        </div>
      </section>
    </main>
  )
}
