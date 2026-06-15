import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  title: {
    default: 'Hair By Nesh | Luxury Hair Salon',
    template: '%s | Hair By Nesh',
  },
  description:
    'Book your appointment with Lanesha, a master stylist with 4 decades of experience. Specializing in color, cuts, braids, extensions, and natural hair care.',
  keywords: ['hair salon', 'hair stylist', 'color', 'cuts', 'bridal hair', 'natural hair'],
  openGraph: {
    title: 'Hair By Nesh | Luxury Hair Salon',
    description: 'Book your appointment with Lanesha — transforming hair and elevating confidence.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
