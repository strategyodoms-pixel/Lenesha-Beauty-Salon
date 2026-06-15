import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendRescheduleNotice, sendCancellationNotice } from '@/lib/email'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar'
import { getAvailableSlots } from '@/lib/slots'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { service: true, discountCode: true },
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(booking)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { service: true },
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Handle reschedule
  if (body.date || body.timeSlot) {
    const newDate = body.date ?? booking.date
    const newTime = body.timeSlot ?? booking.timeSlot

    if (newDate !== booking.date || newTime !== booking.timeSlot) {
      const available = await getAvailableSlots(newDate, booking.isExpress)
      if (!available.find((s) => s.slot === newTime)) {
        return NextResponse.json({ error: 'New time slot is not available' }, { status: 409 })
      }

      const updated = await prisma.booking.update({
        where: { id: params.id },
        data: { date: newDate, timeSlot: newTime, ...body },
        include: { service: true },
      })

      // Calendar update
      if (booking.googleCalendarEventId) {
        await updateCalendarEvent(
          booking.googleCalendarEventId,
          newDate,
          newTime,
          booking.service.durationMinutes
        )
      } else {
        const eventId = await createCalendarEvent({ ...updated, service: updated.service })
        if (eventId) {
          await prisma.booking.update({ where: { id: params.id }, data: { googleCalendarEventId: eventId } })
        }
      }

      await sendRescheduleNotice(
        { ...updated, service: updated.service },
        booking.date,
        booking.timeSlot,
        newDate,
        newTime
      )

      return NextResponse.json(updated)
    }
  }

  // Handle cancellation
  if (body.status === 'CANCELLED') {
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
      include: { service: true },
    })

    if (booking.googleCalendarEventId) {
      await deleteCalendarEvent(booking.googleCalendarEventId)
    }

    await sendCancellationNotice({ ...updated, service: updated.service }, body.reason)
    return NextResponse.json(updated)
  }

  // Handle confirm (from PENDING → CONFIRMED after manual admin action)
  if (body.status === 'CONFIRMED' && booking.status !== 'CONFIRMED') {
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CONFIRMED' },
      include: { service: true },
    })

    if (!booking.googleCalendarEventId) {
      const eventId = await createCalendarEvent({ ...updated, service: updated.service })
      if (eventId) {
        await prisma.booking.update({ where: { id: params.id }, data: { googleCalendarEventId: eventId } })
      }
    }

    return NextResponse.json(updated)
  }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: body,
    include: { service: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const booking = await prisma.booking.findUnique({ where: { id: params.id } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (booking.googleCalendarEventId) {
    await deleteCalendarEvent(booking.googleCalendarEventId)
  }

  await prisma.booking.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
