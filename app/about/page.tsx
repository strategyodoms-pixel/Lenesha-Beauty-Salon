import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About Lanesha' }

export default async function AboutPage() {
  const profile = await prisma.stylistProfile.findFirst()

  const paragraphs = profile?.bio.split('\n\n').filter(Boolean) ?? [
    'With over 30 years behind the chair, Celeste has built a reputation for transformative hair experiences.',
  ]

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section
        className="py-32 px-6 text-center"
        style={{ background: 'linear-gradient(180deg, #F5E6D8 0%, #FDF6F0 100%)' }}
      >
        <p className="font-body text-sm tracking-[0.3em] uppercase text-cta mb-4">Meet Your Stylist</p>
        <h1 className="section-heading">Lanesha</h1>
        <p className="font-body text-text-dark/60 mt-4 text-lg">4 Decades of Artistry</p>
      </section>

      {/* Bio content */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          {/* Photo */}
          <div>
            {profile?.photoUrl ? (
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg">
                <Image
                  src={profile.photoUrl}
                  alt="Lanesha, master hair stylist"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="aspect-[3/4] rounded-3xl flex items-center justify-center text-center p-8"
                style={{ background: 'linear-gradient(135deg, #E8D5C4, #C9A99A)' }}
              >
                <div>
                  <div className="text-7xl mb-4">💇‍♀️</div>
                  <p className="font-body text-sm text-white/80">Photo coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Bio text */}
          <div className="py-8">
            <div className="space-y-6">
              {paragraphs.map((para, idx) => (
                <p key={idx} className="font-body text-text-dark/80 leading-relaxed text-lg">
                  {para}
                </p>
              ))}
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-4 mt-10">
              {[
                ['30+', 'Years Experience'],
                ['1,000+', 'Happy Clients'],
                ['5 ★', 'Average Rating'],
              ].map(([num, label]) => (
                <div key={label} className="bg-secondary/40 rounded-2xl px-6 py-4 text-center">
                  <p className="font-heading text-3xl font-light text-cta">{num}</p>
                  <p className="font-body text-xs text-text-dark/60 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link href="/book" className="btn-primary">
                Book With Lanesha →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-subheading mb-12">Areas of Expertise</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              ['🎨', 'Color'],
              ['✂️', 'Precision Cuts'],
              ['👰', 'Bridal Styling'],
              ['🌿', 'Natural Hair'],
              ['✨', 'Hair Treatments'],
              ['💆', 'Scalp Care'],
            ].map(([icon, label]) => (
              <div key={label} className="card p-6 flex flex-col items-center gap-3">
                <span className="text-3xl">{icon}</span>
                <p className="font-body font-semibold text-sm text-text-dark">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center py-16 px-6">
        <Link href="/" className="font-body text-sm text-text-dark/50 hover:text-cta transition-colors">← Back to Home</Link>
      </div>
    </main>
  )
}
