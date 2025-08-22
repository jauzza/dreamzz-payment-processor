import { NextRequest, NextResponse } from 'next/server'
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false })
const TELEGRAM_CHAT_ID = '-1002884888254'

export async function GET() {
  try {
    console.log('🔍 Testing bot permissions...')
    
    // Get bot info
    const botInfo = await bot.getMe()
    console.log('🤖 Bot info:', botInfo)
    
    // Get chat info
    const chatInfo = await bot.getChat(TELEGRAM_CHAT_ID)
    console.log('💬 Chat info:', chatInfo)
    
    // Get bot's status in the chat
    const botMember = await bot.getChatMember(TELEGRAM_CHAT_ID, botInfo.id)
    console.log('👤 Bot member status:', botMember)
    
    // Get chat administrators
    const admins = await bot.getChatAdministrators(TELEGRAM_CHAT_ID)
    console.log('👑 Chat administrators:', admins.length)
    
    // Check if bot is admin
    const botIsAdmin = admins.some(admin => admin.user.id === botInfo.id)
    
    const permissions = botIsAdmin ? 
      admins.find(admin => admin.user.id === botInfo.id) : null
    
    return NextResponse.json({
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        firstName: botInfo.first_name
      },
      chat: {
        id: chatInfo.id,
        title: chatInfo.title,
        type: chatInfo.type
      },
      botStatus: {
        status: botMember.status,
        isAdmin: botIsAdmin,
        permissions: permissions ? {
          canDeleteMessages: permissions.can_delete_messages,
          canRestrictMembers: permissions.can_restrict_members,
          canPromoteMembers: permissions.can_promote_members,
          canInviteUsers: permissions.can_invite_users
        } : null
      },
      adminCount: admins.length,
      canKickMembers: botIsAdmin && permissions?.can_restrict_members === true
    })
    
  } catch (error: any) {
    console.error('❌ Error testing bot permissions:', error)
    return NextResponse.json({ 
      error: error.message,
      details: 'Bot might not have proper permissions or access to the chat'
    }, { status: 500 })
  }
}