import { discordVerificationStorage } from './discord-verification-storage'

// Discord Bot Configuration
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!
const MONTHLY_ROLE_ID = process.env.DISCORD_MONTHLY_ROLE_ID || '1405263647663456416'
const LIFETIME_ROLE_ID = process.env.DISCORD_LIFETIME_ROLE_ID || '1405262797121650778'

export class DiscordBot {
  private isInitialized = false

  async initialize(): Promise<boolean> {
    try {
      // Test the bot token by making a simple API call
      const response = await fetch(`https://discord.com/api/v10/users/@me`, {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const botInfo = await response.json()
        console.log(`🤖 Discord bot initialized: ${botInfo.username}#${botInfo.discriminator}`)
        this.isInitialized = true
        return true
      } else {
        console.error('❌ Failed to initialize Discord bot: Invalid token')
        return false
      }
    } catch (error) {
      console.error('❌ Failed to initialize Discord bot:', error)
      return false
    }
  }

  async assignRole(userId: string, plan: 'monthly' | 'lifetime'): Promise<boolean> {
    if (!this.isInitialized) {
      console.log('⚠️ Discord bot not initialized')
      return false
    }

    try {
      const roleId = plan === 'lifetime' ? LIFETIME_ROLE_ID : MONTHLY_ROLE_ID
      
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/members/${userId}/roles/${roleId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Audit-Log-Reason': `Premium membership verification - ${plan} plan`
          }
        }
      )

      if (response.ok) {
        console.log(`✅ Assigned ${plan} role to Discord user ${userId}`)
        return true
      } else if (response.status === 404) {
        console.log(`❌ User ${userId} not found in server`)
        return false
      } else {
        const error = await response.text()
        console.error(`❌ Failed to assign role: ${response.status} - ${error}`)
        return false
      }
    } catch (error) {
      console.error('❌ Error assigning Discord role:', error)
      return false
    }
  }

  async removeRole(userId: string, plan: 'monthly' | 'lifetime'): Promise<boolean> {
    if (!this.isInitialized) {
      return false
    }

    try {
      const roleId = plan === 'lifetime' ? LIFETIME_ROLE_ID : MONTHLY_ROLE_ID
      
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/members/${userId}/roles/${roleId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Audit-Log-Reason': `Premium membership expired - ${plan} plan`
          }
        }
      )

      if (response.ok) {
        console.log(`✅ Removed ${plan} role from Discord user ${userId}`)
        return true
      } else {
        const error = await response.text()
        console.error(`❌ Failed to remove role: ${response.status} - ${error}`)
        return false
      }
    } catch (error) {
      console.error('❌ Error removing Discord role:', error)
      return false
    }
  }

  async verifyCode(code: string, discordUserId: string): Promise<{ success: boolean; plan?: string; error?: string }> {
    try {
      const verification = discordVerificationStorage.verifyCode(code, discordUserId)
      
      if (!verification) {
        return { success: false, error: 'Invalid or expired verification code' }
      }

      // Assign the role
      const roleAssigned = await this.assignRole(discordUserId, verification.plan)
      
      if (roleAssigned) {
        return { 
          success: true, 
          plan: verification.plan,
          error: undefined
        }
      } else {
        return { 
          success: false, 
          error: 'Failed to assign role. Make sure you are in the Discord server.' 
        }
      }
    } catch (error) {
      console.error('❌ Error in verifyCode:', error)
      return { 
        success: false, 
        error: 'An error occurred during verification' 
      }
    }
  }

  async getGuildInfo(): Promise<any> {
    try {
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}`,
        {
          headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        return await response.json()
      } else {
        console.error(`❌ Failed to get guild info: ${response.status}`)
        return null
      }
    } catch (error) {
      console.error('❌ Error getting guild info:', error)
      return null
    }
  }
}

// Singleton instance
let discordBot: DiscordBot | null = null

export function getDiscordBot(): DiscordBot {
  if (!discordBot) {
    discordBot = new DiscordBot()
  }
  return discordBot
}

export async function initializeDiscordBot(): Promise<boolean> {
  try {
    const bot = getDiscordBot()
    return await bot.initialize()
  } catch (error) {
    console.error('❌ Failed to initialize Discord bot:', error)
    return false
  }
}