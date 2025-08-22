import { NextRequest, NextResponse } from 'next/server'
import { initializeDiscordBot } from '@/lib/discord-bot'

export async function POST(request: NextRequest) {
  try {
    // Simple admin authentication
    const { secret } = await request.json()
    
    if (secret !== 'dreamzz_discord_init_2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log('🤖 Initializing Discord bot...')
    const success = await initializeDiscordBot()
    
    if (success) {
      console.log('✅ Discord bot initialized successfully!')
      return NextResponse.json({ 
        success: true, 
        message: 'Discord bot initialized successfully',
        serverId: process.env.DISCORD_SERVER_ID,
        monthlyRoleId: process.env.DISCORD_MONTHLY_ROLE_ID || '1405263647663456416',
        lifetimeRoleId: process.env.DISCORD_LIFETIME_ROLE_ID || '1405262797121650778'
      })
    } else {
      console.log('❌ Failed to initialize Discord bot')
      return NextResponse.json({ 
        error: 'Failed to initialize Discord bot' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error initializing Discord bot:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize Discord bot' 
    }, { status: 500 })
  }
} 