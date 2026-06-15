import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { status: { not: 'CANCELLED' } },
    include: { service: true },
    orderBy: { createdAt: 'desc' },
  })

  // Aggregate by email
  const clientMap = new Map<
    string,
    {
      clientName: string
      clientEmail: string
      clientPhone: string
      lastService: string
      lastBookingDate: string
      totalBookings: number
      totalSpend: number
    }
  >()

  for (const b of bookings) {
    const existing = clientMap.get(b.clientEmail)
    if (!existing) {
      clientMap.set(b.clientEmail, {
        clientName: b.clientName,
        clientEmail: b.clientEmail,
        clientPhone: b.clientPhone,
        lastService: b.service.name,
        lastBookingDate: b.date,
        totalBookings: 1,
        totalSpend: b.service.price - (b.discountAmount ?? 0),
      })
    } else {
      existing.totalBookings++
      existing.totalSpend += b.service.price - (b.discountAmount ?? 0)
    }
  }

  const clients = Array.from(clientMap.values())

  const headers = ['Name', 'Email', 'Phone', 'Last Service', 'Last Booking Date', 'Total Bookings', 'Total Spend']
  const rows = clients.map((c) =>
    [
      c.clientName,
      c.clientEmail,
      c.clientPhone,
      c.lastService,
      c.lastBookingDate,
      c.totalBookings,
      `$${c.totalSpend.toFixed(2)}`,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="clients-${date}.csv"`,
    },
  })
}
