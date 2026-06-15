'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const navItems = [
  { label: 'Home',         href: '#top',         type: 'scroll' },
  { label: 'About',        href: '#welcome',      type: 'scroll' },
  { label: 'Services',     href: '/services',     type: 'link'   },
  { label: 'Testimonials', href: '#testimonials', type: 'scroll' },
  { label: 'Book Now',     href: '/book',         type: 'cta'    },
]

export default function NavDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function scrollTo(hash: string) {
    setOpen(false)
    if (hash === '#top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={ref} style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999 }}>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Open navigation"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          padding: '14px 16px 10px',
          background: 'rgba(253,246,240,0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(253,246,240,0.25)',
          borderRadius: '4px',
          cursor: 'pointer',
          minWidth: '64px',
        }}
      >
        <span style={{
          display: 'block', width: '22px', height: '1.5px',
          background: '#fff',
          transform: open ? 'translateY(6.5px) rotate(45deg)' : 'none',
          transition: 'transform 0.25s',
        }} />
        <span style={{
          display: 'block', width: '22px', height: '1.5px',
          background: '#fff',
          opacity: open ? 0 : 1,
          transition: 'opacity 0.2s',
        }} />
        <span style={{
          display: 'block', width: '22px', height: '1.5px',
          background: '#fff',
          transform: open ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
          transition: 'transform 0.25s',
        }} />
        <span style={{
          fontFamily: 'Lato, sans-serif',
          fontSize: '9px',
          letterSpacing: '0.22em',
          color: '#fff',
          marginTop: '4px',
        }}>
          {open ? 'CLOSE' : 'MENU'}
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          minWidth: '200px',
          paddingTop: '8px',
          paddingBottom: '8px',
          background: 'rgba(18,9,4,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(201,169,154,0.3)',
          borderRadius: '4px',
        }}>
          {navItems.map((item) => {
            if (item.type === 'scroll') {
              return (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 28px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Lato, sans-serif',
                    fontSize: '12px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'rgba(253,246,240,0.85)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C9A99A')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(253,246,240,0.85)')}
                >
                  {item.label}
                </button>
              )
            }

            if (item.type === 'cta') {
              return (
                <div key={item.label}>
                  <div style={{ margin: '8px 28px', height: '1px', background: 'rgba(201,169,154,0.2)' }} />
                  <div style={{ padding: '8px 16px 4px' }}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        textAlign: 'center',
                        background: '#B07D6C',
                        color: '#FDF6F0',
                        fontFamily: 'Lato, sans-serif',
                        fontSize: '12px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        borderRadius: '2px',
                        textDecoration: 'none',
                      }}
                    >
                      {item.label}
                    </Link>
                  </div>
                </div>
              )
            }

            // type === 'link'
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 28px',
                  fontFamily: 'Lato, sans-serif',
                  fontSize: '12px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(253,246,240,0.85)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C9A99A')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(253,246,240,0.85)')}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
