import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.siteSettings.findFirst()
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const existing = await prisma.siteSettings.findFirst()

  if (!existing) {
    const created = await prisma.siteSettings.create({ data: body })
    return NextResponse.json(created)
  }

  const updated = await prisma.siteSettings.update({ where: { id: existing.id }, data: body })
  return NextResponse.json(updated)
}
