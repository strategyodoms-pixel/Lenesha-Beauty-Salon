import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmation, sendStylistNotification } from '@/lib/email'
import { createCalendarEvent } from '@/lib/google-calendar'
import { appendBookingToSheet } from '@/lib/google-sheets'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch (err) {
    console.error('[stripe webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const bookingId = session.metadata?.bookingId

    if (!bookingId) return NextResponse.json({ received: true })

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    })

    if (!booking) return NextResponse.json({ received: true })

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        depositPaid: true,
        stripePaymentIntentId: session.payment_intent as string,
      },
      include: { service: true },
    })

    await Promise.allSettled([
      sendBookingConfirmation({ ...updated, service: updated.service }),
      sendStylistNotification({ ...updated, service: updated.service }),
      createCalendarEvent({ ...updated, service: updated.service }).then(async (eventId) => {
        if (eventId) {
          await prisma.booking.update({ where: { id: bookingId }, data: { googleCalendarEventId: eventId } })
        }
      }),
      appendBookingToSheet({ ...updated, service: updated.service, createdAt: updated.createdAt }),
    ])
  }

  return NextResponse.json({ received: true })
}
