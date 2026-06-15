import { prisma } from '@/lib/prisma'

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function generateSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = []
  const start = parseTimeToMinutes(startTime)
  const end = parseTimeToMinutes(endTime)

  for (let t = start; t + durationMinutes <= end; t += durationMinutes) {
    slots.push(minutesToTimeString(t))
  }
  return slots
}

export async function getAvailableSlots(
  date: string,
  isExpress: boolean = false
): Promise<{ slot: string; isPriority: boolean }[]> {
  // Parse dayOfWeek from date string (YYYY-MM-DD)
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  const dayOfWeek = dateObj.getDay()

  // Get working hours config for this day
  const config = await prisma.timeSlotConfig.findFirst({
    where: { dayOfWeek },
  })

  if (!config) return []

  const allSlots = generateSlots(config.startTime, config.endTime, config.slotDurationMinutes)

  // Get booked slots for this date
  const bookedBookings = await prisma.booking.findMany({
    where: {
      date,
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
    select: { timeSlot: true },
  })
  const bookedSlots = new Set(bookedBookings.map((b) => b.timeSlot))

  // Get manually blocked slots
  const blockedSlots = await prisma.blockedSlot.findMany({
    where: { date },
    select: { timeSlot: true },
  })
  const blocked = new Set(blockedSlots.map((b) => b.timeSlot))

  const available = allSlots.filter((s) => !bookedSlots.has(s) && !blocked.has(s))

  // Express: mark first 3 available slots as priority
  return available.map((slot, idx) => ({
    slot,
    isPriority: isExpress && idx < 3,
  }))
}
