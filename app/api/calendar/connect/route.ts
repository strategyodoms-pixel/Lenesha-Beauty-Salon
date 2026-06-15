import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAuthUrl } from '@/lib/google-calendar'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = getAuthUrl()
  return NextResponse.redirect(url)
}
