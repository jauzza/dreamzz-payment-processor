import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()
    
    let baseConfig: any = {
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      metadata: {
        plan: plan,
      },
      automatic_tax: {
        enabled: true,
      },
      // Enable Apple Pay and Google Pay
      payment_method_configuration: process.env.STRIPE_PAYMENT_METHOD_CONFIG || undefined,
    }
    
    if (plan === 'monthly') {
      // Get the monthly product prices
      const prices = await stripe.prices.list({ product: 'prod_SsyXNx4tusFd3R', active: true })
      
      if (prices.data.length === 0) {
        throw new Error('No active prices found for monthly product')
      }
      
      const sessionConfig = {
        ...baseConfig,
        // Subscription-compatible payment methods
        payment_method_types: [
          'card',
          'sepa_debit'
        ],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 1, // 1-day free trial
        },
        line_items: [
          {
            price: prices.data[0].id,
            quantity: 1,
          },
                ],
        // automatic_tax: { enabled: true }, // Disabled until VAT registration
      }
      
      const session = await stripe.checkout.sessions.create(sessionConfig)
      return NextResponse.json({ sessionId: session.id })
      
    } else if (plan === 'lifetime') {
      // Get the lifetime product prices
      const prices = await stripe.prices.list({ product: 'prod_SsyacePJPwOa7S', active: true })
      
      if (prices.data.length === 0) {
        throw new Error('No active prices found for lifetime product')
      }
      
      const sessionConfig = {
        ...baseConfig,
        // One-time payment methods
        payment_method_types: [
          'card',
          'paypal'
        ],
        mode: 'payment',
        line_items: [
          {
            price: prices.data[0].id,
            quantity: 1,
          },
                ],
        // automatic_tax: { enabled: true }, // Disabled until VAT registration
      }
      
      const session = await stripe.checkout.sessions.create(sessionConfig)
      return NextResponse.json({ sessionId: session.id })
      
    } else {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    console.error('Error message:', error.message)
    console.error('Error type:', error.type)
    return NextResponse.json(
      { 
        error: 'Error creating checkout session', 
        details: error.message || 'Unknown error',
        type: error.type || 'unknown'
      },
      { status: 500 }
    )
  }
}