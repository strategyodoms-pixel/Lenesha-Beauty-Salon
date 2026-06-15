'use client'

import Image from 'next/image'
import Link from 'next/link'
import NavDropdown from '@/components/NavDropdown'

const heroImage: string | null = '/hero.jpg'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* ── Background ── */}
      {heroImage ? (
        <Image
          src={heroImage}
          alt="Hair By Nesh salon"
          fill
          priority
          className="object-cover object-center"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, #2A1A12 0%, #3D2B1F 35%, #6B4033 65%, #B07D6C 100%)',
          }}
        />
      )}

      {/* ── Overlay (keeps text readable over any background) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(20,10,5,0.62) 0%, rgba(20,10,5,0.45) 50%, rgba(20,10,5,0.72) 100%)',
        }}
      />

      {/* ── Navigation dropdown — top-right ── */}
      <NavDropdown />

      {/* ── Logo box — top-left ── */}
      <div
        className="absolute top-6 left-6 z-20 flex flex-col items-center gap-2 p-4"
        style={{
          background: 'rgba(253,246,240,0.12)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(253,246,240,0.20)',
          borderRadius: '4px',
          width: '110px',
        }}
      >
        <Image
          src="/logo.svg"
          alt="Hair By Nesh logo"
          width={100}
          height={100}
          className="opacity-90"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <span
          className="font-heading italic text-center leading-tight"
          style={{ color: '#FFFFFF', fontSize: '13px', letterSpacing: '0.08em' }}
        >
          Hair By Nesh
        </span>
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-up">
        {/* Crown + tagline */}
        <div className="flex flex-col items-center mb-8">
          <svg width="90" height="54" viewBox="0 0 100 55" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 drop-shadow-sm">
            {/* 5-point crown body */}
            <path
              d="M5,50 L5,38 L12,24 L22,38 L32,16 L42,36 L50,4 L58,36 L68,16 L78,38 L88,24 L95,38 L95,50 Z"
              stroke="#C9A99A"
              strokeWidth="1.6"
              strokeLinejoin="round"
              fill="rgba(201,169,154,0.15)"
            />
            {/* Base band */}
            <rect x="5" y="44" width="90" height="8" rx="1.5" fill="rgba(201,169,154,0.20)" stroke="#C9A99A" strokeWidth="1.3"/>
            {/* Center jewel (tallest peak) */}
            <circle cx="50" cy="6" r="3.5" fill="#C9A99A"/>
            <circle cx="50" cy="6" r="1.8" fill="#FDF6F0" opacity="0.8"/>
            {/* Mid jewels */}
            <circle cx="32" cy="18" r="2.5" fill="#C9A99A" opacity="0.85"/>
            <circle cx="68" cy="18" r="2.5" fill="#C9A99A" opacity="0.85"/>
            {/* Outer jewels */}
            <circle cx="12" cy="26" r="2" fill="#C9A99A" opacity="0.65"/>
            <circle cx="88" cy="26" r="2" fill="#C9A99A" opacity="0.65"/>
            {/* Base gems */}
            <circle cx="22" cy="48" r="1.8" fill="rgba(232,213,196,0.7)"/>
            <circle cx="50" cy="48" r="1.8" fill="rgba(232,213,196,0.7)"/>
            <circle cx="78" cy="48" r="1.8" fill="rgba(232,213,196,0.7)"/>
          </svg>

          {/* Luxury Hair Studio with flanking lines */}
          <div className="flex items-center gap-4">
            <div className="h-px w-10" style={{ background: 'rgba(201,169,154,0.6)' }} />
            <p className="font-body text-xs tracking-[0.35em] uppercase" style={{ color: '#C9A99A' }}>
              Luxury Hair Studio
            </p>
            <div className="h-px w-10" style={{ background: 'rgba(201,169,154,0.6)' }} />
          </div>
        </div>

        <h1
          className="font-heading font-light leading-tight mb-6"
          style={{ color: '#FFFFFF', fontSize: 'clamp(2.8rem, 7vw, 6.5rem)' }}
        >
          Transforming Hair,
          <br />
          <em className="italic font-light" style={{ color: '#FFFFFF' }}>
            Elevating Confidence.
          </em>
        </h1>

        <p className="font-body text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed" style={{ color: '#FFFFFF' }}>
          Experience the art of hair styling with Hair By Nesh where every appointment
          is a personal journey to your most radiant self.
        </p>

        <div className="flex justify-center">
          <Link
            href="/book"
            className="text-base px-10 py-4 font-body tracking-wider uppercase transition-all duration-300"
            style={{
              background: '#B07D6C',
              color: '#FDF6F0',
              borderRadius: '2px',
              letterSpacing: '0.15em',
            }}
          >
            Book Your Appointment
          </Link>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ opacity: 0.5 }}>
        <span className="font-body text-xs tracking-widest uppercase" style={{ color: '#E8D5C4' }}>Scroll</span>
        <div className="w-px h-12 animate-pulse" style={{ background: 'rgba(232,213,196,0.6)' }} />
      </div>
    </section>
  )
}
