import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@celesteandco.com'
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'changeme123'

  // Upsert admin user
  const passwordHash = await bcrypt.hash(adminPassword, 12)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, name: 'Nesh' },
  })
  console.log(`Admin user ready: ${adminEmail}`)

  // Upsert site settings (always update expressUpcharge to $60)
  const existingSettings = await prisma.siteSettings.findFirst()
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        requireDeposit: false,
        depositAmount: 25,
        depositType: 'FLAT',
        expressUpcharge: 60,
        expressUpchargeType: 'FLAT',
      },
    })
  } else {
    await prisma.siteSettings.update({
      where: { id: existingSettings.id },
      data: { expressUpcharge: 60, expressUpchargeType: 'FLAT' },
    })
  }
  console.log('Site settings ready (express = $60)')

  // Seed stylist profile
  const existingProfile = await prisma.stylistProfile.findFirst()
  if (!existingProfile) {
    await prisma.stylistProfile.create({
      data: {
        photoUrl: '/owner.png',
        bio: `Lanesha's love for hair started long before she ever stood behind a chair. Growing up, she learned the art of styling from her brothers, discovering early that hair was more than a skill — it was a way to connect, create, and build confidence in others.

By middle school, Lanesha was already doing hair for friends and family, drawn to the transformation that happens when someone looks in the mirror and truly loves what they see. That spark never faded.

With over four decades behind the chair, Lanesha has mastered everything from relaxers and color to braids, extensions, sew-ins, and natural hair care. Every client who sits in her chair gets her full attention, creativity, and heart.

But Lanesha's vision goes beyond the salon. She is passionate about teaching the next generation of stylists and has dreams of developing her own product line — built on the same principles she has lived by for 40 years: quality, care, and transformation.

When you book with Lanesha, you are not just getting a hairstyle. You are getting four decades of passion in every strand.`,
      },
    })
    console.log('Stylist profile created')
  }

  // Seed services only if none exist yet
  const serviceCount = await prisma.service.count()
  if (serviceCount > 0) {
    console.log('Services already exist — skipping')
  } else {
  await prisma.service.createMany({
    data: [
      // ── Main Services ──────────────────────────────────────────
      {
        name: 'Relaxer — Virgin',
        description: 'First-time relaxer service for natural hair. Includes shampoo, treatment, and style finish.',
        price: 85,
        durationMinutes: 120,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Relaxer — Retouch',
        description: 'Touch-up relaxer for previously relaxed hair. Keeps your roots smooth and healthy.',
        price: 70,
        durationMinutes: 90,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Temporary Color',
        description: 'Semi-permanent color that refreshes your look without long-term commitment. Fades gracefully over time.',
        price: 75,
        durationMinutes: 90,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Permanent Color',
        description: 'Long-lasting color with rich, vibrant results. Custom-blended to complement your skin tone and style.',
        price: 90,
        durationMinutes: 120,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Extensions',
        description: 'Seamless hair extensions for added length and volume. Consultation included to match your natural hair.',
        price: 150,
        durationMinutes: 180,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Box Braids',
        description: 'Classic or knotless box braids in your preferred size and length. A timeless protective style.',
        price: 150,
        durationMinutes: 240,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Formal Up Do',
        description: 'Elegant updo for weddings, proms, galas, or any special occasion. Polished and long-lasting.',
        price: 75,
        durationMinutes: 90,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Basic Braids',
        description: 'Clean, classic braids for a fresh protective style. Great for all hair types and lengths.',
        price: 50,
        durationMinutes: 150,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Design Braids',
        description: 'Custom intricate braid patterns and designs. Express your personal style with creative braiding.',
        price: 75,
        durationMinutes: 180,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Bleaching Knots',
        description: 'Knot bleaching service to create a natural-looking hairline on lace wigs and frontals.',
        price: 40,
        durationMinutes: 60,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Sew-In with Closure',
        description: 'Full sew-in weave installation with closure for a seamless, natural finish. Long-lasting and versatile.',
        price: 180,
        durationMinutes: 180,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Hair Cut & Blow Dry',
        description: 'Precision cut tailored to your face shape and lifestyle, finished with a smooth blow dry and style.',
        price: 60,
        durationMinutes: 90,
        isActive: true,
        isAddon: false,
      },
      {
        name: 'Xpress Cut',
        description: 'A quick, clean cut for when you need a fresh look fast. No extras — just a sharp trim.',
        price: 40,
        durationMinutes: 30,
        isActive: true,
        isAddon: false,
      },

      // ── Add-Ons (isAddon: true) ────────────────────────────────
      {
        name: 'Iron Works',
        description: 'Add heat styling with flat iron or curling iron to finish your look.',
        price: 20,
        durationMinutes: 0,
        isActive: true,
        isAddon: true,
      },
      {
        name: 'Hair Cut Add-On',
        description: 'Add a precision cut to any service.',
        price: 20,
        durationMinutes: 0,
        isActive: true,
        isAddon: true,
      },
      {
        name: 'Long Hair Upcharge',
        description: 'For hair past shoulder length — extra time and product required.',
        price: 25,
        durationMinutes: 0,
        isActive: true,
        isAddon: true,
      },
      {
        name: 'Deep Conditioning Treatment',
        description: 'Intensive moisture and protein treatment for stronger, shinier, healthier hair.',
        price: 15,
        durationMinutes: 0,
        isActive: true,
        isAddon: true,
      },
    ],
  })
  console.log('Services seeded with real prices')
  } // end if serviceCount === 0

  // Seed time slot configs
  const slotConfigCount = await prisma.timeSlotConfig.count()
  if (slotConfigCount === 0) {
    const workingDays = [1, 2, 3, 4, 5, 6]
    await prisma.timeSlotConfig.createMany({
      data: workingDays.map((day) => ({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        slotDurationMinutes: 60,
      })),
    })
    console.log('Time slot configs seeded')
  }

  // Seed testimonials
  const testimonialCount = await prisma.testimonial.count()
  if (testimonialCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          clientFirstName: 'Jasmine',
          serviceReceived: 'Silk Press',
          rating: 5,
          quote: 'She was amazing! I love my silk press. I was so silky and im natural. I love it!',
          isVisible: true,
        },
        {
          clientFirstName: 'Monica',
          serviceReceived: 'Silk Press',
          rating: 5,
          quote: 'When I come in she knows exactly what to do. She always understand the assignment. Book her now!',
          isVisible: true,
        },
        {
          clientFirstName: 'Renée',
          serviceReceived: 'Box Braids',
          rating: 5,
          quote: 'Finally found someone who truly understands my hair. Nesh took her time and my braids are flawless. So much care and skill.',
          isVisible: true,
        },
        {
          clientFirstName: 'Diane',
          serviceReceived: 'Relaxer — Retouch',
          rating: 5,
          quote: "Nesh's attention to detail is unmatched. My hair is always healthy and smooth after every visit. I've been coming for years.",
          isVisible: true,
        },
      ],
    })
    console.log('Testimonials seeded')
  }

  console.log('Seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
