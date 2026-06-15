import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getAvailableSlots } from '@/lib/slots'
import { sendBookingConfirmation, sendStylistNotification } from '@/lib/email'
import { createCalendarEvent } from '@/lib/google-calendar'
import { appendBookingToSheet } from '@/lib/google-sheets'
import { createDepositCheckoutSession } from '@/lib/stripe'
import { z } from 'zod'

const BookingSchema = z.object({
  serviceId: z.string().min(1),
  addonServiceIds: z.array(z.string()).default([]),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(7),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  inspirationPhotoUrls: z.array(z.string()).max(5).default([]),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
  isExpress: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const date = searchParams.get('date')

  const bookings = await prisma.booking.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(date ? { date } : {}),
    },
    include: { service: true, discountCode: true },
    orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
  })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = BookingSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { serviceId, addonServiceIds, clientName, clientEmail, clientPhone, date, timeSlot,
    inspirationPhotoUrls, notes, discountCode, isExpress } = parsed.data

  // Check slot still available
  const available = await getAvailableSlots(date, isExpress)
  if (!available.find((s) => s.slot === timeSlot)) {
    return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 })
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  // Calculate addon total
  let addonTotal = 0
  if (addonServiceIds.length > 0) {
    const addonServices = await prisma.service.findMany({ where: { id: { in: addonServiceIds }, isAddon: true } })
    addonTotal = addonServices.reduce((sum, a) => sum + a.price, 0)
  }

  // Resolve discount code
  let discountCodeRecord = null
  let discountAmount = 0
  if (discountCode) {
    discountCodeRecord = await prisma.discountCode.findFirst({
      where: {
        code: discountCode.toUpperCase(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })
    if (discountCodeRecord) {
      discountAmount =
        discountCodeRecord.type === 'PERCENT'
          ? (service.price * discountCodeRecord.value) / 100
          : discountCodeRecord.value
    }
  }

  // Get settings for deposit logic
  const settings = await prisma.siteSettings.findFirst()
  const requireDeposit = settings?.requireDeposit ?? false

  // Calculate express upcharge
  let expressUpcharge = 0
  if (isExpress && settings) {
    expressUpcharge =
      settings.expressUpchargeType === 'PERCENT'
        ? (service.price * settings.expressUpcharge) / 100
        : settings.expressUpcharge
  }

  // Create booking
  let booking
  try {
    booking = await prisma.booking.create({
      data: {
        serviceId,
        clientName,
        clientEmail,
        clientPhone,
        date,
        timeSlot,
        status: requireDeposit ? 'PENDING' : 'CONFIRMED',
        isExpress,
        inspirationPhotoUrls: JSON.stringify(inspirationPhotoUrls),
        addonServiceIds: JSON.stringify(addonServiceIds),
        addonTotal,
        notes,
        discountCodeId: discountCodeRecord?.id,
        discountAmount: discountAmount > 0 ? discountAmount : null,
      },
      include: { service: true },
    })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'This time slot was just taken. Please choose another.' }, { status: 409 })
    }
    throw err
  }

  // Increment discount usage
  if (discountCodeRecord) {
    await prisma.discountCode.update({
      where: { id: discountCodeRecord.id },
      data: { usageCount: { increment: 1 } },
    })
  }

  if (requireDeposit && settings) {
    const depositAmount =
      settings.depositType === 'PERCENT'
        ? (service.price * settings.depositAmount) / 100
        : settings.depositAmount

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const session = await createDepositCheckoutSession({
      bookingId: booking.id,
      serviceName: service.name,
      clientName,
      clientEmail,
      depositAmountCents: Math.round((depositAmount + expressUpcharge - discountAmount) * 100),
      successUrl: `${baseUrl}/book/success?bookingId=${booking.id}`,
      cancelUrl: `${baseUrl}/book?cancelled=true`,
    })

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        depositAmount,
        stripeSessionId: session.id,
      },
    })

    return NextResponse.json({ bookingId: booking.id, stripeUrl: session.url })
  }

  // No deposit — confirm immediately and trigger side effects
  await Promise.allSettled([
    sendBookingConfirmation({ ...booking, service }),
    sendStylistNotification({ ...booking, service }),
    createCalendarEvent({ ...booking, service }).then(async (eventId) => {
      if (eventId) await prisma.booking.update({ where: { id: booking.id }, data: { googleCalendarEventId: eventId } })
    }),
    appendBookingToSheet({ ...booking, service, createdAt: booking.createdAt }),
  ])

  return NextResponse.json({ bookingId: booking.id }, { status: 201 })
}
