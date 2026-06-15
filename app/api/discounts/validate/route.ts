import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const serviceId = searchParams.get('serviceId')

  if (!code) return NextResponse.json({ valid: false, message: 'No code provided' })

  const discountCode = await prisma.discountCode.findFirst({
    where: {
      code: code.toUpperCase(),
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  })

  if (!discountCode) {
    return NextResponse.json({ valid: false, message: 'Invalid or expired discount code' })
  }

  let discountAmount = 0
  if (serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (service) {
      discountAmount =
        discountCode.type === 'PERCENT'
          ? (service.price * discountCode.value) / 100
          : discountCode.value
    }
  }

  return NextResponse.json({
    valid: true,
    type: discountCode.type,
    value: discountCode.value,
    discountAmount,
    message: `Code applied: ${discountCode.type === 'PERCENT' ? `${discountCode.value}% off` : `$${discountCode.value} off`}`,
  })
}
