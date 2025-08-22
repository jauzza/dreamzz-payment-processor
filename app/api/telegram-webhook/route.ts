import { NextRequest, NextResponse } from 'next/server'
import { revokeTelegramInviteLink } from '@/lib/telegram'
import { linkStorage } from '@/lib/link-storage'
import { memberStorage } from '@/lib/member-storage'

const TELEGRAM_CHAT_ID = '-1002884888254'

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    
    console.log('📱 Telegram webhook received:', JSON.stringify(update, null, 2))
    
    // Handle new chat members (someone joined the group)
    if (update.message?.new_chat_members) {
      const newMembers = update.message.new_chat_members
      console.log(`👥 New members joined:`, newMembers.length)
      
      // Process each new member
      for (const newMember of newMembers) {
        if (newMember.is_bot) continue // Skip bots
        
        console.log(`👤 Processing new member: ${newMember.first_name} (@${newMember.username})`)
        
        // Try to find which payment session this member corresponds to
        const allLinks = linkStorage.getAll()
        const recentLinks = allLinks.filter(link => 
          link.createdAt > Date.now() - (10 * 60 * 1000) // Within last 10 minutes
        )
        
        if (recentLinks.length > 0) {
          // Assume the most recent link corresponds to this user
          const matchingLink = recentLinks[recentLinks.length - 1]
          
          // Calculate subscription end date
          const now = Date.now()
          const subscriptionEnd = matchingLink.plan === 'monthly' 
            ? now + (32 * 24 * 60 * 60 * 1000) // 32 days from now (with flexibility)
            : undefined // lifetime has no end date
          
          // Add member to our tracking system
          memberStorage.addMember({
            userId: newMember.id,
            username: newMember.username,
            firstName: newMember.first_name,
            lastName: newMember.last_name,
            plan: matchingLink.plan as 'monthly' | 'lifetime',
            joinedAt: now,
            subscriptionStart: now,
            subscriptionEnd,
            sessionId: matchingLink.sessionId,
            active: true
          })
          
          console.log(`✅ Tracked new ${matchingLink.plan} member: ${newMember.first_name}`)
        } else {
          console.log(`⚠️ No recent payment found for new member: ${newMember.first_name}`)
        }
      }
      
      // Revoke all invite links since someone has joined
      const allLinks = linkStorage.getAll()
      for (const link of allLinks) {
        if (link.telegramLink && !link.telegramLink.includes('(USED)')) {
          try {
            await revokeTelegramInviteLink(TELEGRAM_CHAT_ID, link.telegramLink)
            console.log(`🚫 Revoked invite link for session: ${link.sessionId}`)
            
            linkStorage.store(link.sessionId, {
              ...link,
              telegramLink: `${link.telegramLink} (USED)`,
              note: 'Link automatically revoked after member joined'
            })
          } catch (error) {
            console.error(`❌ Error revoking link for session ${link.sessionId}:`, error)
          }
        }
      }
    }
    
    // Handle chat member left (optional: for logging)
    if (update.message?.left_chat_member) {
      console.log(`👋 Member left:`, update.message.left_chat_member.username)
    }
    
    return NextResponse.json({ ok: true })
    
  } catch (error: any) {
    console.error('❌ Telegram webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET endpoint for webhook verification (if needed)
export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook endpoint active' })
}