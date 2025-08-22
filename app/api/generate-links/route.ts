import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createTelegramInviteLink } from '@/lib/telegram'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// You'll need to set these to your actual Discord server and Telegram chat IDs
const DISCORD_SERVER_ID = 'YOUR_DISCORD_SERVER_ID' // Replace with your Discord server ID
const TELEGRAM_CHAT_ID = '-1002884888254'   // Your Telegram group chat ID

export async function POST(request: NextRequest) {
  try {
    const { sessionId, plan } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Skip Stripe verification for test sessions
    if (!sessionId.startsWith('cs_test_')) {
      // Verify the payment was successful or it's a trial
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      
      // For trial, payment_status will be 'no_payment_required'
      // For paid plans, payment_status should be 'paid'
      if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
        return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
      }
    }

    const links: { discord?: string; telegram?: string } = {}

    try {
      // Generate Discord invite link (you'll need to implement Discord bot integration)
      // For now, this is a placeholder - you'll need to set up a Discord bot
      if (DISCORD_SERVER_ID !== 'YOUR_DISCORD_SERVER_ID') {
        // This would be implemented with a Discord bot
        links.discord = `https://discord.gg/PLACEHOLDER-${Math.random().toString(36).substring(7)}`
      }

      // Generate Telegram invite link
      if (TELEGRAM_CHAT_ID !== 'YOUR_TELEGRAM_CHAT_ID') {
        links.telegram = await createTelegramInviteLink(TELEGRAM_CHAT_ID, sessionId)
      }

      // If no chat IDs are configured, return placeholder links for testing
      if (!links.discord && !links.telegram) {
        return NextResponse.json({
          discord: `https://discord.gg/DEMO-${Math.random().toString(36).substring(7)}`,
          telegram: `https://t.me/+DEMO${Math.random().toString(36).substring(7)}`,
          note: 'Demo links - configure your Discord and Telegram IDs in the API'
        })
      }

      return NextResponse.json(links)
    } catch (error) {
      console.error('Error generating invite links:', error)
      return NextResponse.json(
        { error: 'Failed to generate invite links' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in generate-links API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}