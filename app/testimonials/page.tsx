import { prisma } from '@/lib/prisma'
import TestimonialCard from '@/components/TestimonialCard'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Client Testimonials' }

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' },
  })

  const avgRating = testimonials.length > 0
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
    : 5

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section
        className="py-32 px-6 text-center"
        style={{ background: 'linear-gradient(180deg, #F5E6D8 0%, #FDF6F0 100%)' }}
      >
        <p className="font-body text-sm tracking-[0.3em] uppercase text-cta mb-4">Reviews</p>
        <h1 className="section-heading">Client Testimonials</h1>
        {testimonials.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <svg key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'text-cta' : 'text-secondary'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="font-body text-text-dark/60 text-sm">
              {avgRating.toFixed(1)} average · {testimonials.length} reviews
            </p>
          </div>
        )}
      </section>

      {/* Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {testimonials.length === 0 ? (
            <p className="text-center font-body text-text-dark/50">Reviews coming soon.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="text-center py-12 px-6 bg-white">
        <h2 className="section-subheading mb-4">Ready to experience it?</h2>
        <Link href="/book" className="btn-primary">Book Your Appointment →</Link>
      </div>

      <div className="text-center py-8 px-6">
        <Link href="/" className="font-body text-sm text-text-dark/50 hover:text-cta transition-colors">← Back to Home</Link>
      </div>
    </main>
  )
}
