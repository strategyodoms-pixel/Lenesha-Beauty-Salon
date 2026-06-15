import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-06-20',
})

type DepositSessionParams = {
  bookingId: string
  serviceName: string
  clientName: string
  clientEmail: string
  depositAmountCents: number
  successUrl: string
  cancelUrl: string
}

export async function createDepositCheckoutSession(params: DepositSessionParams) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: params.clientEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: params.depositAmountCents,
          product_data: {
            name: `Deposit — ${params.serviceName}`,
            description: `Booking deposit for ${params.clientName}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: params.bookingId },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  })

  return session
}
