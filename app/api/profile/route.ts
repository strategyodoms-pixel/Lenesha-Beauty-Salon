import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const profile = await prisma.stylistProfile.findFirst()
  return NextResponse.json(profile)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const existing = await prisma.stylistProfile.findFirst()

  if (!existing) {
    const created = await prisma.stylistProfile.create({ data: body })
    return NextResponse.json(created)
  }

  const updated = await prisma.stylistProfile.update({ where: { id: existing.id }, data: body })
  return NextResponse.json(updated)
}
