import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const TestimonialSchema = z.object({
  clientFirstName: z.string().min(1),
  serviceReceived: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  quote: z.string().min(1),
  isVisible: z.boolean().optional().default(false),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const visible = searchParams.get('visible')

  const testimonials = await prisma.testimonial.findMany({
    where: visible === 'true' ? { isVisible: true } : {},
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(testimonials)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = TestimonialSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const testimonial = await prisma.testimonial.create({ data: parsed.data })
  return NextResponse.json(testimonial, { status: 201 })
}
