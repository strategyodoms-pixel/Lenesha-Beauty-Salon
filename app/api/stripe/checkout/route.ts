import { NextRequest, NextResponse } from 'next/server'
import { createDepositCheckoutSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { bookingId } = await req.json()

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  })

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const settings = await prisma.siteSettings.findFirst()
  const depositAmount = settings?.depositAmount ?? 25
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const session = await createDepositCheckoutSession({
    bookingId: booking.id,
    serviceName: booking.service.name,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    depositAmountCents: Math.round(depositAmount * 100),
    successUrl: `${baseUrl}/book/success?bookingId=${booking.id}`,
    cancelUrl: `${baseUrl}/book?cancelled=true`,
  })

  return NextResponse.json({ url: session.url })
}
