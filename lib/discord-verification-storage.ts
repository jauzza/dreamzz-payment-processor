// Simple in-memory storage for Discord verification codes
// In production, use a database like Redis, PostgreSQL, etc.

interface VerificationCode {
  code: string
  sessionId: string
  email?: string
  plan: 'monthly' | 'lifetime'
  createdAt: number
  used: boolean
  discordUserId?: string
}

class DiscordVerificationStorage {
  private codes = new Map<string, VerificationCode>()
  private sessionToCode = new Map<string, string>()

  generateCode(sessionId: string, plan: 'monthly' | 'lifetime', email?: string): string {
    // Generate a 6-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const verification: VerificationCode = {
      code,
      sessionId,
      email,
      plan,
      createdAt: Date.now(),
      used: false
    }
    
    this.codes.set(code, verification)
    this.sessionToCode.set(sessionId, code)
    
    // Clean up old codes (older than 24 hours)
    this.cleanup()
    
    console.log(`✅ Generated Discord verification code: ${code} for session ${sessionId} (${plan})`)
    return code
  }

  verifyCode(code: string, discordUserId: string): VerificationCode | null {
    const verification = this.codes.get(code.toUpperCase())
    
    if (!verification) {
      console.log(`❌ Invalid verification code: ${code}`)
      return null
    }
    
    if (verification.used) {
      console.log(`❌ Verification code already used: ${code}`)
      return null
    }
    
    // Check if code is expired (24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    if (verification.createdAt < oneDayAgo) {
      console.log(`❌ Verification code expired: ${code}`)
      return null
    }
    
    // Mark as used
    verification.used = true
    verification.discordUserId = discordUserId
    
    console.log(`✅ Verified code ${code} for Discord user ${discordUserId} (${verification.plan})`)
    return verification
  }

  getCodeBySession(sessionId: string): string | undefined {
    return this.sessionToCode.get(sessionId)
  }

  private cleanup() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    
    for (const [code, verification] of this.codes.entries()) {
      if (verification.createdAt < oneDayAgo) {
        this.codes.delete(code)
        this.sessionToCode.delete(verification.sessionId)
      }
    }
  }

  // Debug methods
  getAllCodes(): VerificationCode[] {
    return Array.from(this.codes.values())
  }

  clearAll() {
    this.codes.clear()
    this.sessionToCode.clear()
  }
}

export const discordVerificationStorage = new DiscordVerificationStorage()