// Simple in-memory storage for invite links
// In production, use a database like Redis, PostgreSQL, etc.

interface StoredLink {
  sessionId: string
  telegramLink?: string
  discordLink?: string
  createdAt: number
  plan: string
}

class LinkStorage {
  private links = new Map<string, StoredLink>()

  store(sessionId: string, data: Partial<StoredLink>) {
    const existing = this.links.get(sessionId) || {
      sessionId,
      createdAt: Date.now(),
      plan: 'unknown'
    }
    
    this.links.set(sessionId, { ...existing, ...data })
    
    // Clean up old links (older than 24 hours)
    this.cleanup()
  }

  get(sessionId: string): StoredLink | undefined {
    return this.links.get(sessionId)
  }

  delete(sessionId: string): boolean {
    return this.links.delete(sessionId)
  }

  private cleanup() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    for (const [sessionId, link] of this.links.entries()) {
      if (link.createdAt < oneDayAgo) {
        this.links.delete(sessionId)
      }
    }
  }

  // Get all stored links (for debugging)
  getAll() {
    return Array.from(this.links.values())
  }
}

export const linkStorage = new LinkStorage()