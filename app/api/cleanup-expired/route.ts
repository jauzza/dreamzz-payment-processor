import { NextRequest, NextResponse } from 'next/server'
import { memberStorage } from '@/lib/member-storage'
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false })
const TELEGRAM_CHAT_ID = '-1002884888254'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting expired member cleanup...')
    
    const expiredMembers = memberStorage.getExpiredMonthlyMembers()
    const results = {
      found: expiredMembers.length,
      kicked: 0,
      errors: 0,
      details: [] as any[]
    }
    
    for (const member of expiredMembers) {
      try {
        const daysExpired = member.subscriptionEnd 
          ? Math.floor((Date.now() - member.subscriptionEnd) / (24 * 60 * 60 * 1000))
          : 0
        
        console.log(`⏰ Kicking expired member: ${member.firstName} (@${member.username}) - ${daysExpired} days expired`)
        
        // Kick the member from Telegram group
        await bot.banChatMember(TELEGRAM_CHAT_ID, member.userId, {
          until_date: Math.floor(Date.now() / 1000) + 60, // Ban for 1 minute, then they can rejoin if they pay again
          revoke_messages: false // Keep their messages
        })
        
        // Mark as inactive in our system
        memberStorage.deactivateMember(member.userId, `Monthly subscription expired ${daysExpired} days ago`)
        
        results.kicked++
        results.details.push({
          userId: member.userId,
          username: member.username,
          firstName: member.firstName,
          daysExpired,
          status: 'kicked'
        })
        
        console.log(`✅ Successfully kicked ${member.firstName}`)
        
        // Add a small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error: any) {
        console.error(`❌ Error kicking member ${member.firstName}:`, error.message)
        results.errors++
        results.details.push({
          userId: member.userId,
          username: member.username,
          firstName: member.firstName,
          status: 'error',
          error: error.message
        })
      }
    }
    
    console.log(`🧹 Cleanup complete: ${results.kicked} kicked, ${results.errors} errors`)
    
    return NextResponse.json(results)
    
  } catch (error: any) {
    console.error('❌ Cleanup process error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Just return expired members without kicking them (dry run)
    const expired = memberStorage.getExpiredMonthlyMembers()
    
    return NextResponse.json({
      message: 'Dry run - no members were kicked',
      expired: expired.map(m => ({
        userId: m.userId,
        username: m.username,
        firstName: m.firstName,
        plan: m.plan,
        subscriptionEnd: m.subscriptionEnd,
        daysExpired: m.subscriptionEnd ? Math.floor((Date.now() - m.subscriptionEnd) / (24 * 60 * 60 * 1000)) : 0
      }))
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}