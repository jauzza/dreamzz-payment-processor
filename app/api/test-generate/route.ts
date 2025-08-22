import { NextRequest, NextResponse } from 'next/server'
import { createTelegramInviteLink } from '@/lib/telegram'
import { linkStorage } from '@/lib/link-storage'
import { discordVerificationStorage } from '@/lib/discord-verification-storage'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})
const TELEGRAM_CHAT_ID = '-1002884888254'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, amount } = await request.json()
    
    // Verify session exists and was paid
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
    }

    // Check if session is recent (within 15 minutes)
    const sessionCreated = session.created * 1000
    const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000)
    
    if (sessionCreated < fifteenMinutesAgo) {
      return NextResponse.json({ error: 'Session expired' }, { status: 403 })
    }
    
    console.log(`🧪 Test generating links for session: ${sessionId}`)
    
    // Generate Telegram invite link (bot now has permissions!)
    const telegramLink = await createTelegramInviteLink(TELEGRAM_CHAT_ID, sessionId)
    
    // Determine plan based on amount (in cents)
    let plan = 'unknown'
    if (amount === 1499) { // €14.99 in cents
      plan = 'monthly'
    } else if (amount === 3499) { // €34.99 in cents
      plan = 'lifetime'
    }
    
    // Check if links already exist (prevent multiple generations)
    const existingLinks = linkStorage.get(sessionId)
    if (existingLinks && existingLinks.telegramLink) {
      return NextResponse.json({ error: 'Links already generated for this session' }, { status: 403 })
    }

    // Generate Discord verification code
    const discordCode = discordVerificationStorage.generateCode(sessionId, plan as 'monthly' | 'lifetime')

    // Store the generated link and verification code
    linkStorage.store(sessionId, {
      telegramLink,
      discordLink: discordCode, // Store verification code instead of invite link
      plan
    })
    
    console.log(`✅ Test: Generated and stored invite links for session ${sessionId}`)
    console.log(`Plan: ${plan}, Amount: €${amount/100}, Telegram: ${telegramLink}`)
    
    return NextResponse.json({
      success: true,
      sessionId,
      plan,
      telegramLink,
      amount: amount / 100
    })
    
  } catch (error) {
    console.error('❌ Error in test generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate test links' },
      { status: 500 }
    )
  }
}