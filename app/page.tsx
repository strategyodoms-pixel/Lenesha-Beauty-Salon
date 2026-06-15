import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/HeroSection'
import ServiceCard from '@/components/ServiceCard'
import TestimonialCard from '@/components/TestimonialCard'
import ExpressBookingBanner from '@/components/ExpressBookingBanner'
import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
  const [services, testimonials, settings, profile] = await Promise.all([
    prisma.service.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' }, take: 3 }),
    prisma.testimonial.findMany({ where: { isVisible: true }, orderBy: { createdAt: 'desc' }, take: 2 }),
    prisma.siteSettings.findFirst(),
    prisma.stylistProfile.findFirst(),
  ])

  return (
    <main className="min-h-screen">
      <HeroSection />

      {/* Welcome / intro */}
      <section id="welcome" className="py-24 px-6" style={{ background: '#FDF6F0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-14">

            {/* Owner photo circle */}
            <div className="relative flex-shrink-0">
              {/* Outer decorative ring */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: '-10px',
                  border: '1px solid rgba(201,169,154,0.35)',
                  borderRadius: '9999px',
                }}
              />
              <div
                className="relative rounded-full overflow-hidden"
                style={{
                  width: '256px',
                  height: '256px',
                  border: '2px solid #C9A99A',
                }}
              >
                {profile?.photoUrl ? (
                  <Image
                    src={profile.photoUrl}
                    alt="Lanesha — Hair By Nesh"
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-3"
                    style={{ background: '#F5EBE5' }}
                  >
                    {/* Person silhouette placeholder */}
                    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                      <circle cx="36" cy="26" r="14" stroke="#C9A99A" strokeWidth="1.8"/>
                      <path d="M8 68 C8 50 20 42 36 42 C52 42 64 50 64 68" stroke="#C9A99A" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <span className="font-body text-xs tracking-widest uppercase" style={{ color: '#B07D6C' }}>
                      Add Photo
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="font-body text-sm tracking-[0.3em] uppercase text-cta mb-4">Welcome</p>
              <h2 className="section-heading mb-6 text-left">
                Hair that tells your story
              </h2>
              <p className="font-body text-lg text-text-dark/70 leading-relaxed mb-10">
                At Hair By Nesh, every client is treated as an individual. With years of
                experience in color, cuts, and specialty styling, Lanesha brings a rare combination
                of artistry and technical mastery to every chair.
              </p>
              <Link href="/about" className="btn-outline inline-block">
                Learn About Lanesha →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-sm tracking-[0.3em] uppercase text-cta mb-3">What We Offer</p>
            <h2 className="section-heading">Signature Services</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((svc, idx) => (
              <ServiceCard key={svc.id} service={svc} featured={idx === 0} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" className="btn-outline">
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials teaser */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="font-body text-sm tracking-[0.3em] uppercase text-cta mb-3">Client Love</p>
              <h2 className="section-heading">What They're Saying</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/testimonials" className="btn-outline">
                Read More Reviews →
              </Link>
            </div>
          </div>
        </section>
      )}

      <ExpressBookingBanner upcharge={settings?.expressUpcharge ?? 20} />

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="font-heading text-2xl font-light text-text-dark mb-4">Hair By Nesh</h3>
              <p className="font-body text-sm text-text-dark/60 leading-relaxed">
                Luxury hair studio specializing in color, cuts, bridal styling, and natural hair care.
              </p>
            </div>
            <div>
              <h4 className="font-body font-semibold text-text-dark mb-4 text-sm tracking-wide uppercase">Quick Links</h4>
              <ul className="space-y-2">
                {[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/book', 'Book'], ['/testimonials', 'Testimonials']].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="font-body text-sm text-text-dark/60 hover:text-cta transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-body font-semibold text-text-dark mb-4 text-sm tracking-wide uppercase">Book Now</h4>
              <Link href="/book" className="btn-primary text-sm mb-3 block text-center">
                Book an Appointment
              </Link>
              <Link href="/express" className="btn-outline text-sm block text-center">
                ⚡ Express Booking
              </Link>
            </div>
          </div>
          <div className="border-t border-secondary/30 pt-8 text-center">
            <p className="font-body text-xs text-text-dark/40">
              © {new Date().getFullYear()} Hair By Nesh All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
