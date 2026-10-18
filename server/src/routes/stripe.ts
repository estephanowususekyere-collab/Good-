import { Router } from 'express'
import Stripe from 'stripe'
import prisma from '../prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

function getStripeClient() {
  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.startsWith('dev-placeholder')) return null
  return new Stripe(STRIPE_SECRET_KEY)
}

router.post('/checkout', authMiddleware, async (req, res) => {
  const user = req.user as any
  const { packageId } = req.body
  if (!packageId) return res.status(400).json({ error: 'Package ID is required' })

  const pkg = await prisma.package.findUnique({ where: { id: packageId } })
  if (!pkg) return res.status(404).json({ error: 'Package not found' })

  const stripe = getStripeClient()
  if (!stripe) {
    // Dev mode without Stripe — grant credits directly
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { increment: pkg.credits } },
    })
    await prisma.payment.create({
      data: {
        userId: user.id,
        packageId: pkg.id,
        amount: pkg.price,
        credits: pkg.credits,
        status: 'completed',
      },
    })
    return res.json({ demoMode: true, message: `Added ${pkg.credits} credits (Stripe not configured)` })
  }

  const origin = req.headers.origin || `http://localhost:3000`
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: pkg.stripePriceId
      ? [{ price: pkg.stripePriceId, quantity: 1 }]
      : [{
          price_data: {
            currency: 'usd',
            product_data: { name: pkg.name, description: pkg.description },
            unit_amount: pkg.price,
          },
          quantity: 1,
        }],
    mode: 'payment',
    success_url: `${origin}/packages?success=1`,
    cancel_url: `${origin}/packages?canceled=1`,
    metadata: { userId: user.id, packageId: pkg.id, credits: String(pkg.credits) },
  })

  await prisma.payment.create({
    data: {
      userId: user.id,
      packageId: pkg.id,
      stripeSessionId: session.id,
      amount: pkg.price,
      credits: pkg.credits,
      status: 'pending',
    },
  })

  res.json({ url: session.url })
})

router.post('/webhook', async (req, res) => {
  const stripe = getStripeClient()
  if (!stripe) return res.json({ received: false })

  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    if (webhookSecret && !webhookSecret.startsWith('dev-placeholder')) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } else {
      event = req.body
    }
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits || '0', 10)

    if (userId && credits) {
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: credits } },
      })
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'completed' },
      })
    }
  }

  res.json({ received: true })
})

export default router
