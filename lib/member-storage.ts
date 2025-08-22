// Member management system
// In production, use a proper database like PostgreSQL, MongoDB, etc.

export interface Member {
  userId: number // Telegram user ID
  username?: string
  firstName?: string
  lastName?: string
  plan: 'monthly' | 'lifetime'
  joinedAt: number // timestamp
  subscriptionStart: number // timestamp
  subscriptionEnd?: number // timestamp (null for lifetime)
  sessionId: string // Original payment session
  stripeCustomerId?: string
  active: boolean
  lastChecked?: number
}

class MemberStorage {
  private members = new Map<number, Member>() // userId -> Member

  // Add a new member
  addMember(member: Member) {
    this.members.set(member.userId, member)
    console.log(`➕ Added ${member.plan} member: ${member.firstName} (@${member.username})`)
    this.cleanup()
  }

  // Get member by user ID
  getMember(userId: number): Member | undefined {
    return this.members.get(userId)
  }

  // Update member info
  updateMember(userId: number, updates: Partial<Member>) {
    const existing = this.members.get(userId)
    if (existing) {
      this.members.set(userId, { ...existing, ...updates })
    }
  }

  // Get all members
  getAllMembers(): Member[] {
    return Array.from(this.members.values())
  }

  // Get members by plan type
  getMembersByPlan(plan: 'monthly' | 'lifetime'): Member[] {
    return this.getAllMembers().filter(m => m.plan === plan && m.active)
  }

  // Get expired monthly members
  getExpiredMonthlyMembers(): Member[] {
    const now = Date.now()
    return this.getAllMembers().filter(m => 
      m.plan === 'monthly' && 
      m.active && 
      m.subscriptionEnd && 
      m.subscriptionEnd < now
    )
  }

  // Mark member as inactive (kicked/left)
  deactivateMember(userId: number, reason: string) {
    const member = this.members.get(userId)
    if (member) {
      member.active = false
      member.lastChecked = Date.now()
      console.log(`❌ Deactivated member ${member.firstName} (@${member.username}): ${reason}`)
    }
  }

  // Check if user should have access
  hasValidAccess(userId: number): boolean {
    const member = this.getMember(userId)
    if (!member || !member.active) return false
    
    if (member.plan === 'lifetime') return true
    
    // For monthly: check if subscription is still valid
    const now = Date.now()
    return member.subscriptionEnd ? member.subscriptionEnd > now : false
  }

  // Get subscription status
  getSubscriptionStatus(userId: number): 'active' | 'expired' | 'not_found' {
    const member = this.getMember(userId)
    if (!member) return 'not_found'
    if (!member.active) return 'expired'
    
    if (member.plan === 'lifetime') return 'active'
    
    const now = Date.now()
    return (member.subscriptionEnd && member.subscriptionEnd > now) ? 'active' : 'expired'
  }

  // Clean up old inactive members (older than 30 days)
  private cleanup() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    for (const [userId, member] of this.members.entries()) {
      if (!member.active && member.lastChecked && member.lastChecked < thirtyDaysAgo) {
        this.members.delete(userId)
      }
    }
  }

  // Get stats
  getStats() {
    const all = this.getAllMembers()
    const active = all.filter(m => m.active)
    const monthly = active.filter(m => m.plan === 'monthly')
    const lifetime = active.filter(m => m.plan === 'lifetime')
    const expired = this.getExpiredMonthlyMembers()
    
    return {
      total: all.length,
      active: active.length,
      monthly: monthly.length,
      lifetime: lifetime.length,
      expired: expired.length,
      inactive: all.length - active.length
    }
  }

  // Debug: get all data
  getAll() {
    return Array.from(this.members.entries()).map(([userId, member]) => ({
      userId,
      ...member
    }))
  }
}

export const memberStorage = new MemberStorage()