import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createTelegramInviteLink } from '@/lib/telegram'
import { linkStorage } from '@/lib/link-storage'
import { discordVerificationStorage } from '@/lib/discord-verification-storage'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
const TELEGRAM_CHAT_ID = '-1002884888254'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle the event
  console.log('📥 Webhook received:', event.type, event.id)
  
  switch (event.type) {
    case 'checkout.session.completed':
    case 'payment_intent.succeeded':
      // Handle both checkout sessions and payment intents
      let sessionId: string
      let amount: number
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        sessionId = session.id
        // Use amount_subtotal (original price) instead of amount_total (after discounts)
        // This handles free trials and discount codes properly
        amount = session.amount_subtotal || session.amount_total || 0
        console.log('💳 Checkout session completed:', sessionId, 'Amount total:', session.amount_total, 'Amount subtotal:', session.amount_subtotal)
      } else {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        sessionId = paymentIntent.id
        amount = paymentIntent.amount || 0
        console.log('💳 Payment intent succeeded:', sessionId, 'Amount:', amount)
      }
      
      try {
        console.log(`🔄 Starting link generation for session ${sessionId}, amount: ${amount}`)
        
        // Check if links already exist for this session (prevent duplicates)
        const existingLinks = linkStorage.get(sessionId)
        if (existingLinks && existingLinks.telegramLink) {
          console.log(`⚠️ Links already exist for session ${sessionId}, skipping generation`)
          break
        }
        
        // Determine plan based on amount (in cents)
        let plan = 'unknown'
        if (amount === 1499) { // €14.99 in cents
          plan = 'monthly'
        } else if (amount === 3499) { // €34.99 in cents
          plan = 'lifetime'
        }
        console.log(`📋 Plan determined: ${plan}`)
        
        // Generate Telegram invite link with timeout
        console.log(`🤖 Calling Telegram API for session ${sessionId}...`)
        const telegramLink = await createTelegramInviteLink(TELEGRAM_CHAT_ID, sessionId)
        console.log(`🔗 Telegram link generated: ${telegramLink}`)
        
        // Generate Discord verification code
        console.log(`🎫 Generating Discord verification code for session ${sessionId}...`)
        const discordCode = discordVerificationStorage.generateCode(sessionId, plan as 'monthly' | 'lifetime')
        console.log(`🔗 Discord verification code generated: ${discordCode}`)
        
        // Store the generated link and verification code
        linkStorage.store(sessionId, {
          telegramLink,
          discordLink: discordCode, // Store verification code instead of invite link
          plan
        })
        
        console.log(`✅ Generated and stored invite links for session ${sessionId}`)
        console.log(`Plan: ${plan}, Amount: €${amount/100}, Telegram: ${telegramLink}`)
        
      } catch (error) {
        console.error('❌ Error generating invite link for session', sessionId, ':', error)
        console.error('❌ Error details:', error instanceof Error ? error.message : String(error))
        
        // Store error info for debugging
        linkStorage.store(sessionId, {
          error: `Failed to generate links: ${error instanceof Error ? error.message : String(error)}`,
          plan: amount === 1499 ? 'monthly' : amount === 3499 ? 'lifetime' : 'unknown'
        })
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}