import { NextRequest, NextResponse } from 'next/server'
import { getDiscordBot } from '@/lib/discord-bot'

export async function POST(request: NextRequest) {
  try {
    const { code, discordUserId } = await request.json()

    if (!code || !discordUserId) {
      return NextResponse.json({ 
        error: 'Code and Discord user ID are required' 
      }, { status: 400 })
    }

    const bot = getDiscordBot()
    const result = await bot.verifyCode(code, discordUserId)
    
    if (result.success) {
      const planEmoji = result.plan === 'lifetime' ? '👑' : '⭐'
      const planText = result.plan === 'lifetime' ? 'Lifetime Premium' : 'Monthly Premium'
      
      return NextResponse.json({
        success: true,
        plan: result.plan,
        message: `🎉 **Welcome to dreamzz Premium!** ${planEmoji}\n\n` +
                 `✅ You've been granted the **${planText}** role!\n` +
                 `🔓 You now have access to all premium channels.\n\n` +
                 `${result.plan === 'monthly' ? '📅 Your membership lasts for 32 days.' : '🌟 Enjoy your lifetime access!'}`
      })
    } else {
      return NextResponse.json({ 
        error: result.error || 'Verification failed',
        message: '❌ **Invalid or expired verification code!**\n\nPlease check your code from the payment confirmation page. Codes expire after 24 hours.'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error verifying Discord code:', error)
    return NextResponse.json({ 
      error: 'Failed to verify code',
      message: '❌ **An error occurred!** Please try again or contact support.'
    }, { status: 500 })
  }
} 