import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  })
}

export async function exchangeCodeForToken(code: string): Promise<boolean> {
  try {
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)
    if (!tokens.refresh_token) return false

    const settings = await prisma.siteSettings.findFirst()
    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: { googleRefreshToken: tokens.refresh_token },
      })
    }
    return true
  } catch (err) {
    console.error('[calendar] Token exchange failed:', err)
    return false
  }
}

async function getAuthenticatedClient() {
  const settings = await prisma.siteSettings.findFirst()
  if (!settings?.googleRefreshToken) return null

  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: settings.googleRefreshToken })
  return oauth2Client
}

type CalendarBookingData = {
  clientName: string
  date: string
  timeSlot: string
  service: { name: string; durationMinutes: number }
}

function buildEventTimes(date: string, timeSlot: string, durationMinutes: number) {
  const [h, m] = timeSlot.split(':').map(Number)
  const start = new Date(`${date}T${timeSlot}:00`)
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
  return {
    start: { dateTime: start.toISOString(), timeZone: 'America/New_York' },
    end: { dateTime: end.toISOString(), timeZone: 'America/New_York' },
  }
}

export async function createCalendarEvent(booking: CalendarBookingData): Promise<string | null> {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth) return null

    const calendar = google.calendar({ version: 'v3', auth })
    const times = buildEventTimes(booking.date, booking.timeSlot, booking.service.durationMinutes)

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `${booking.clientName} — ${booking.service.name}`,
        description: `Hair appointment at Celeste & Co.`,
        ...times,
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 60 }],
        },
      },
    })

    return event.data.id ?? null
  } catch (err) {
    console.error('[calendar] Failed to create event:', err)
    return null
  }
}

export async function updateCalendarEvent(
  eventId: string,
  newDate: string,
  newTime: string,
  durationMinutes: number
): Promise<boolean> {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth) return false

    const calendar = google.calendar({ version: 'v3', auth })
    const times = buildEventTimes(newDate, newTime, durationMinutes)

    await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: times,
    })
    return true
  } catch (err) {
    console.error('[calendar] Failed to update event:', err)
    return false
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth) return false

    const calendar = google.calendar({ version: 'v3', auth })
    await calendar.events.delete({ calendarId: 'primary', eventId })
    return true
  } catch (err) {
    console.error('[calendar] Failed to delete event:', err)
    return false
  }
}
