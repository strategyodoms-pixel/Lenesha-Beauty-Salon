import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@celesteandco.com'
const STYLIST_EMAIL = process.env.STYLIST_EMAIL || 'stylist@celesteandco.com'

function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(timeSlot: string): string {
  const [h, m] = timeSlot.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

type BookingEmailData = {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  timeSlot: string
  isExpress: boolean
  depositPaid: boolean
  depositAmount?: number | null
  discountAmount?: number | null
  notes?: string | null
  service: { name: string; price: number; durationMinutes: number }
}

export async function sendBookingConfirmation(booking: BookingEmailData) {
  try {
    await resend.emails.send({
      from: FROM,
      to: booking.clientEmail,
      subject: `Your appointment is confirmed — Celeste & Co.`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D2B1F; background: #FDF6F0; padding: 40px;">
          <h1 style="font-size: 32px; font-weight: 300; margin-bottom: 8px;">You're all set, ${booking.clientName.split(' ')[0]}!</h1>
          <p style="color: #B07D6C; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 32px;">Appointment Confirmed</p>

          <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px;"><strong>Service:</strong> ${booking.service.name}${booking.isExpress ? ' ⚡ Express' : ''}</p>
            <p style="margin: 0 0 12px;"><strong>Date:</strong> ${formatDate(booking.date)}</p>
            <p style="margin: 0 0 12px;"><strong>Time:</strong> ${formatTime(booking.timeSlot)}</p>
            <p style="margin: 0 0 12px;"><strong>Duration:</strong> approximately ${booking.service.durationMinutes} minutes</p>
            ${booking.depositPaid ? `<p style="margin: 0 0 12px;"><strong>Deposit paid:</strong> $${booking.depositAmount?.toFixed(2)}</p>` : ''}
            ${booking.discountAmount ? `<p style="margin: 0 0 12px;"><strong>Discount applied:</strong> -$${booking.discountAmount.toFixed(2)}</p>` : ''}
            ${booking.notes ? `<p style="margin: 0;"><strong>Notes:</strong> ${booking.notes}</p>` : ''}
          </div>

          <p style="font-size: 14px; color: #8B6E5F;">Need to reschedule? Reply to this email or call us. We look forward to seeing you!</p>
          <p style="font-size: 12px; color: #C9A99A; margin-top: 32px;">Celeste & Co. Luxury Hair Studio</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send booking confirmation:', err)
  }
}

export async function sendStylistNotification(booking: BookingEmailData) {
  try {
    await resend.emails.send({
      from: FROM,
      to: STYLIST_EMAIL,
      subject: `New booking: ${booking.clientName} — ${formatDate(booking.date)} at ${formatTime(booking.timeSlot)}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D2B1F; padding: 40px;">
          <h2>New Appointment${booking.isExpress ? ' ⚡ Express' : ''}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0;"><strong>Client:</strong></td><td>${booking.clientName}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Email:</strong></td><td>${booking.clientEmail}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Phone:</strong></td><td>${booking.clientPhone}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Service:</strong></td><td>${booking.service.name}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Date:</strong></td><td>${formatDate(booking.date)}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Time:</strong></td><td>${formatTime(booking.timeSlot)}</td></tr>
            ${booking.depositPaid ? `<tr><td style="padding: 8px 0;"><strong>Deposit:</strong></td><td>$${booking.depositAmount?.toFixed(2)} paid</td></tr>` : ''}
            ${booking.notes ? `<tr><td style="padding: 8px 0;"><strong>Notes:</strong></td><td>${booking.notes}</td></tr>` : ''}
          </table>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send stylist notification:', err)
  }
}

export async function sendRescheduleNotice(
  booking: BookingEmailData,
  oldDate: string,
  oldTime: string,
  newDate: string,
  newTime: string
) {
  try {
    await resend.emails.send({
      from: FROM,
      to: booking.clientEmail,
      subject: `Your appointment has been rescheduled — Celeste & Co.`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D2B1F; background: #FDF6F0; padding: 40px;">
          <h1 style="font-size: 28px; font-weight: 300;">Appointment Rescheduled</h1>
          <p>Hi ${booking.clientName.split(' ')[0]}, your appointment has been moved to a new time.</p>

          <div style="background: white; border-radius: 16px; padding: 32px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #B07D6C;"><strong>Previous time:</strong></p>
            <p style="margin: 0 0 16px; text-decoration: line-through; color: #999;">${formatDate(oldDate)} at ${formatTime(oldTime)}</p>
            <p style="margin: 0 0 8px; color: #3D2B1F;"><strong>New time:</strong></p>
            <p style="margin: 0; font-size: 18px; color: #B07D6C;">${formatDate(newDate)} at ${formatTime(newTime)}</p>
          </div>

          <p style="font-size: 14px; color: #8B6E5F;">If this doesn't work for you, please reply and we'll find a better time.</p>
          <p style="font-size: 12px; color: #C9A99A; margin-top: 32px;">Celeste & Co. Luxury Hair Studio</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send reschedule notice:', err)
  }
}

export async function sendCancellationNotice(booking: BookingEmailData, reason?: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: booking.clientEmail,
      subject: `Your appointment has been cancelled — Celeste & Co.`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D2B1F; background: #FDF6F0; padding: 40px;">
          <h1 style="font-size: 28px; font-weight: 300;">Appointment Cancelled</h1>
          <p>Hi ${booking.clientName.split(' ')[0]}, your appointment on ${formatDate(booking.date)} at ${formatTime(booking.timeSlot)} has been cancelled.</p>
          ${reason ? `<div style="background: white; border-radius: 16px; padding: 24px; margin: 24px 0;"><strong>Reason:</strong> ${reason}</div>` : ''}
          <p style="font-size: 14px; color: #8B6E5F;">We hope to see you again soon. Book your next appointment anytime at our website.</p>
          <p style="font-size: 12px; color: #C9A99A; margin-top: 32px;">Celeste & Co. Luxury Hair Studio</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send cancellation notice:', err)
  }
}
