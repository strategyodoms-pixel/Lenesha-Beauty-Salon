'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/appointments', label: 'Appointments', icon: '📅' },
  { href: '/admin/services', label: 'Services', icon: '✂️' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
  { href: '/admin/bio', label: 'Bio & Photo', icon: '👤' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-secondary/30 flex flex-col">
      <div className="p-6 border-b border-secondary/30">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-cta mb-1">Admin</p>
        <h2 className="font-heading text-2xl font-light text-text-dark">Hair By Nesh</h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-secondary/40 text-text-dark font-semibold'
                      : 'text-text-dark/60 hover:bg-secondary/20 hover:text-text-dark'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-secondary/30">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 text-sm font-body text-text-dark/50 hover:text-text-dark transition-colors mb-2"
        >
          ← View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-body text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}
