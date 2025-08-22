// Simple in-memory storage for session access tracking
interface SessionAccess {
  sessionId: string
  hasViewed: boolean
  viewedAt?: number
  createdAt: number
}

class SessionStorage {
  private sessions = new Map<string, SessionAccess>()

  // Mark a session as viewed (one-time access)
  markAsViewed(sessionId: string): void {
    const existing = this.sessions.get(sessionId)
    if (existing) {
      existing.hasViewed = true
      existing.viewedAt = Date.now()
    } else {
      this.sessions.set(sessionId, {
        sessionId,
        hasViewed: true,
        viewedAt: Date.now(),
        createdAt: Date.now()
      })
    }
    console.log(`🔒 Session ${sessionId} marked as viewed (one-time access used)`)
  }

  // Check if session has already been viewed
  hasBeenViewed(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    return session?.hasViewed ?? false
  }

  // Cleanup old sessions (older than 1 hour)
  cleanup(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.createdAt < oneHourAgo) {
        this.sessions.delete(sessionId)
      }
    }
  }

  // Debug: Get all sessions
  getAll(): SessionAccess[] {
    return Array.from(this.sessions.values())
  }
}

export const sessionStorage = new SessionStorage()

// Cleanup old sessions periodically
setInterval(() => {
  sessionStorage.cleanup()
}, 5 * 60 * 1000) // Cleanup every 5 minutes