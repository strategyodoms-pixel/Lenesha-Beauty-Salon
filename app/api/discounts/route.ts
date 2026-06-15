import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const DiscountSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  type: z.enum(['FLAT', 'PERCENT']),
  value: z.number().positive(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(codes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = DiscountSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const code = await prisma.discountCode.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  })
  return NextResponse.json(code, { status: 201 })
}
