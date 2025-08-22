import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sessionStorage } from '@/lib/session-storage'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('session_id')
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
    // Check if session has already been viewed (one-time access)
    if (sessionStorage.hasBeenViewed(sessionId)) {
      return NextResponse.json({ error: 'Session already used' }, { status: 403 })
    }

    // Verify session exists in Stripe and was completed
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Session not paid' }, { status: 403 })
    }

    // Check if session is recent (within 15 minutes of payment)
    const sessionCreated = session.created * 1000 // Convert to milliseconds
    const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000) // 15 minutes in milliseconds
    
    if (sessionCreated < fifteenMinutesAgo) {
      return NextResponse.json({ error: 'Session expired' }, { status: 403 })
    }

    // Return session info if valid
    return NextResponse.json({
      valid: true,
      plan: session.amount_subtotal === 1499 ? 'monthly' : 'lifetime',
      customerEmail: session.customer_details?.email,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Session verification failed:', error)
    return NextResponse.json({ error: 'Invalid session' }, { status: 403 })
  }
}