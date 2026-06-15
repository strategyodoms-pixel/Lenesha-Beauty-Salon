import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const ServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  durationMinutes: z.number().int().positive(),
  isActive: z.boolean().optional().default(true),
})

export async function GET() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ServiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const service = await prisma.service.create({ data: parsed.data })
  return NextResponse.json(service, { status: 201 })
}
