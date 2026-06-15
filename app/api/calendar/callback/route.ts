import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/google-calendar'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect('/admin/settings?calendar=error')
  }

  const success = await exchangeCodeForToken(code)
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return NextResponse.redirect(
    `${baseUrl}/admin/settings?calendar=${success ? 'connected' : 'error'}`
  )
}
