import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false })

// In-memory store for used links (in production, use a database)
const usedLinks = new Set<string>()

export async function createTelegramInviteLink(
  chatId: string, 
  sessionId: string,
  expireDate?: number
) {
  try {
    // Create a unique invite link that expires in 24 hours and allows only 1 member
    const inviteLink = await bot.createChatInviteLink(chatId, {
      name: `Payment-${sessionId.substring(0, 8)}`, // Name for tracking
      expire_date: expireDate || Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      member_limit: 1, // Critical: Only ONE person can use this link
      creates_join_request: false, // Direct join without approval
    })
    
    console.log(`🔗 Created one-time Telegram invite for session ${sessionId}:`, {
      link: inviteLink.invite_link,
      expireDate: new Date((expireDate || Math.floor(Date.now() / 1000) + (24 * 60 * 60)) * 1000),
      memberLimit: 1,
      autoRevoke: true
    })
    
    return inviteLink.invite_link
  } catch (error) {
    console.error('❌ Error creating Telegram invite link:', error)
    throw error
  }
}

export async function revokeTelegramInviteLink(chatId: string, inviteLink: string) {
  try {
    // Manually revoke the link if needed
    await bot.revokeChatInviteLink(chatId, inviteLink)
    console.log('Revoked Telegram invite link:', inviteLink)
  } catch (error) {
    console.error('Error revoking Telegram invite link:', error)
    throw error
  }
}

export async function getChatInfo(chatId: string) {
  try {
    const chat = await bot.getChat(chatId)
    return chat
  } catch (error) {
    console.error('Error getting chat info:', error)
    throw error
  }
}

export async function getChatMemberCount(chatId: string) {
  try {
    const count = await bot.getChatMemberCount(chatId)
    return count
  } catch (error) {
    console.error('Error getting chat member count:', error)
    throw error
  }
}