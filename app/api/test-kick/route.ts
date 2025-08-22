import { NextRequest, NextResponse } from 'next/server'
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false })
const TELEGRAM_CHAT_ID = '-1002884888254'

export async function POST(request: NextRequest) {
  try {
    const { userId, reason = 'Testing kick functionality' } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    console.log(`🧪 Testing kick for user ${userId}...`)
    
    try {
      // Try to kick the user (ban for 1 minute then unban)
      await bot.banChatMember(TELEGRAM_CHAT_ID, userId, {
        until_date: Math.floor(Date.now() / 1000) + 60, // Ban for 1 minute
        revoke_messages: false // Keep their messages
      })
      
      console.log(`✅ Successfully kicked user ${userId}`)
      
      return NextResponse.json({
        success: true,
        message: `User ${userId} was kicked from the group`,
        action: 'kicked',
        banDuration: '1 minute',
        reason
      })
      
    } catch (kickError: any) {
      console.error(`❌ Failed to kick user ${userId}:`, kickError.message)
      
      return NextResponse.json({
        success: false,
        error: kickError.message,
        details: 'This could happen if: 1) User not in group, 2) User is admin, 3) Bot lacks permissions, 4) Invalid user ID'
      }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error('❌ Test kick error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with {"userId": 123456789} to test kicking a user',
    example: {
      method: 'POST',
      body: { userId: 123456789, reason: 'Test kick' }
    }
  })
}