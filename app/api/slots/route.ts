import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/slots'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const isExpress = searchParams.get('express') === 'true'

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const slots = await getAvailableSlots(date, isExpress)
  return NextResponse.json(slots)
}
