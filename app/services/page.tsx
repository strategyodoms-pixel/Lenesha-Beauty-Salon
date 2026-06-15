import { prisma } from '@/lib/prisma'
import ServiceCard from '@/components/ServiceCard'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Services' }

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section
        className="py-32 px-6 text-center"
        style={{ background: 'linear-gradient(180deg, #F5E6D8 0%, #FDF6F0 100%)' }}
      >
        <p className="font-body text-sm tracking-[0.3em] uppercase text-cta mb-4">The Menu</p>
        <h1 className="section-heading">Our Services</h1>
        <p className="font-body text-text-dark/60 mt-4 text-lg max-w-xl mx-auto leading-relaxed">
          Every service is tailored to you. No two appointments are alike.
        </p>
      </section>

      {/* Services grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {services.length === 0 ? (
            <p className="text-center font-body text-text-dark/50">Services coming soon.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc, idx) => (
                <ServiceCard key={svc.id} service={svc} featured={idx === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Express CTA */}
      <section className="py-16 px-6 text-center bg-white">
        <h2 className="section-subheading mb-4">Need it sooner?</h2>
        <p className="font-body text-text-dark/60 mb-8">Express booking gives you priority scheduling.</p>
        <Link href="/express" className="btn-primary">
          ⚡ Express Booking
        </Link>
      </section>

      <div className="text-center py-12 px-6">
        <Link href="/" className="font-body text-sm text-text-dark/50 hover:text-cta transition-colors">← Back to Home</Link>
      </div>
    </main>
  )
}
