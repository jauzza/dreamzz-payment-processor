import { NextRequest, NextResponse } from 'next/server'
import { linkStorage } from '@/lib/link-storage'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
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

    const storedLinks = linkStorage.get(sessionId)

    if (!storedLinks) {
      return NextResponse.json({ 
        error: 'Links not found. Payment may still be processing.' 
      }, { status: 404 })
    }

    // Return the links
    const response = {
      discord: storedLinks.discordLink,
      telegram: storedLinks.telegramLink,
      plan: storedLinks.plan
    }

    // IMPORTANT: Delete the links after returning them (one-time access)
    linkStorage.delete(sessionId)
    console.log(`🔒 Links deleted for session ${sessionId} - one-time access used`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error retrieving links:', error)
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
  }
}