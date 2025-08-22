import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export async function redirectToCheckout(plan: 'monthly' | 'lifetime') {
  try {
    // Your Stripe Payment Links for each plan
    const paymentLinks = {
      monthly: 'https://buy.stripe.com/3cIcN5gZW8JUeoee134AU0i',
      lifetime: 'https://buy.stripe.com/9B6fZh8tq3pAa7YaOR4AU0h'
    }
    
    const paymentLink = paymentLinks[plan]
    
    // For webhooks, we'll redirect to success page immediately after payment
    // The webhook will handle generating the actual invite links
    const successUrl = encodeURIComponent(`${window.location.origin}/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`)
    const cancelUrl = encodeURIComponent(window.location.origin)
    
    // Add success_url and cancel_url parameters
    const separator = paymentLink.includes('?') ? '&' : '?'
    const paymentUrl = `${paymentLink}${separator}success_url=${successUrl}&cancel_url=${cancelUrl}`
    
    console.log('Redirecting to payment link:', paymentUrl)
    window.location.href = paymentUrl
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    throw error
  }
}