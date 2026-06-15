import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

async function getAuthenticatedClient() {
  const settings = await prisma.siteSettings.findFirst()
  if (!settings?.googleRefreshToken) return null

  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: settings.googleRefreshToken })
  return { auth: oauth2Client, sheetsId: settings.googleSheetsId }
}

type SheetsBookingData = {
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  timeSlot: string
  isExpress: boolean
  depositPaid: boolean
  discountCode?: string | null
  notes?: string | null
  service: { name: string }
  createdAt: Date
}

function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US')
}

function formatTime(timeSlot: string): string {
  const [h, m] = timeSlot.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

const HEADERS = [
  'Date Booked',
  'Client Name',
  'Email',
  'Phone',
  'Service',
  'Appointment Date',
  'Appointment Time',
  'Express',
  'Deposit Paid',
  'Discount Code',
  'Notes',
]

export async function appendBookingToSheet(booking: SheetsBookingData): Promise<void> {
  try {
    const result = await getAuthenticatedClient()
    if (!result?.sheetsId) return

    const { auth, sheetsId } = result
    const sheets = google.sheets({ version: 'v4', auth })

    // Ensure header row exists
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetsId,
      range: 'Sheet1!A1:K1',
    })

    if (!existing.data.values?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetsId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [HEADERS] },
      })
    }

    const row = [
      booking.createdAt.toLocaleDateString('en-US'),
      booking.clientName,
      booking.clientEmail,
      booking.clientPhone,
      booking.service.name,
      formatDate(booking.date),
      formatTime(booking.timeSlot),
      booking.isExpress ? 'Yes' : 'No',
      booking.depositPaid ? 'Yes' : 'No',
      booking.discountCode ?? '',
      booking.notes ?? '',
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetsId,
      range: 'Sheet1!A:K',
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  } catch (err) {
    console.error('[sheets] Failed to append booking:', err)
  }
}
