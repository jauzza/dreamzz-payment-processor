import { NextRequest, NextResponse } from 'next/server'
import { discordVerificationStorage } from '@/lib/discord-verification-storage'

export async function POST(request: NextRequest) {
  try {
    const { code, discordUserId } = await request.json()
    
    if (!code || !discordUserId) {
      return NextResponse.json({ 
        error: 'Missing code or discordUserId',
        message: '❌ **Invalid request!** Please provide both code and Discord user ID.'
      }, { status: 400 })
    }

    // Verify the code and get the verification data
    const verification = discordVerificationStorage.verifyCode(code, discordUserId)
    
    if (!verification) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification code',
        message: '❌ **Invalid or expired verification code!**\n\nPlease check your code from the payment confirmation page. Codes expire after 24 hours.'
      }, { status: 400 })
    }

    // Return the verification data for the external bot to handle
    return NextResponse.json({
      success: true,
      plan: verification.plan,
      sessionId: verification.sessionId,
      createdAt: verification.createdAt,
      message: `✅ **Code verified successfully!**\n\n` +
               `📋 **Plan:** ${verification.plan === 'lifetime' ? 'Lifetime Premium' : 'Monthly Premium'}\n` +
               `🆔 **Session:** ${verification.sessionId}\n` +
               `⏰ **Created:** ${new Date(verification.createdAt).toLocaleString()}\n\n` +
               `🎯 **Next step:** Your bot should now assign the appropriate role to user ${discordUserId}`
    })
    
  } catch (error) {
    console.error('Error verifying Discord code:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: '❌ **Server error!** Please try again later.'
    }, { status: 500 })
  }
}