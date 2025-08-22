import { NextRequest, NextResponse } from 'next/server'

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!
const MONTHLY_ROLE_ID = process.env.DISCORD_MONTHLY_ROLE_ID || '1405263647663456416'
const LIFETIME_ROLE_ID = process.env.DISCORD_LIFETIME_ROLE_ID || '1405262797121650778'

export async function POST(request: NextRequest) {
  try {
    const { userId, plan, botToken } = await request.json()
    
    if (!userId || !plan || !botToken) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: '❌ **Invalid request!** Please provide userId, plan, and botToken.'
      }, { status: 400 })
    }

    // Validate plan
    if (plan !== 'monthly' && plan !== 'lifetime') {
      return NextResponse.json({ 
        error: 'Invalid plan',
        message: '❌ **Invalid plan!** Must be "monthly" or "lifetime".'
      }, { status: 400 })
    }

    // Use the provided bot token or fall back to environment variable
    const tokenToUse = botToken || DISCORD_BOT_TOKEN
    
    if (!tokenToUse) {
      return NextResponse.json({ 
        error: 'No bot token provided',
        message: '❌ **Bot token missing!** Please provide a valid Discord bot token.'
      }, { status: 400 })
    }

    const roleId = plan === 'lifetime' ? LIFETIME_ROLE_ID : MONTHLY_ROLE_ID
    
    // Assign role using Discord API
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/members/${userId}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${tokenToUse}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.ok) {
      const planEmoji = plan === 'lifetime' ? '👑' : '⭐'
      const planText = plan === 'lifetime' ? 'Lifetime Premium' : 'Monthly Premium'
      
      return NextResponse.json({
        success: true,
        plan,
        roleId,
        message: `🎉 **Welcome to dreamzz Premium!** ${planEmoji}\n\n` +
                 `✅ You've been granted the **${planText}** role!\n` +
                 `🔓 You now have access to all premium channels.\n\n` +
                 `${plan === 'monthly' ? '📅 Your membership lasts for 32 days.' : '🌟 Enjoy your lifetime access!'}`
      })
    } else {
      const errorData = await response.text()
      console.error('Discord API error:', response.status, errorData)
      
      return NextResponse.json({ 
        error: 'Failed to assign role',
        discordError: errorData,
        message: '❌ **Failed to assign role!** Make sure:\n' +
                 '• The user is in the Discord server\n' +
                 '• The bot has the "Manage Roles" permission\n' +
                 '• The role exists and is below the bot\'s role'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error assigning Discord role:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: '❌ **Server error!** Please try again later.'
    }, { status: 500 })
  }
} 