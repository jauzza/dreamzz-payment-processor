import { NextRequest, NextResponse } from 'next/server'
import { linkStorage } from '@/lib/link-storage'

export async function POST(request: NextRequest) {
  try {
    // Simple admin authentication (in production, use proper auth)
    const { secret } = await request.json()
    
    if (secret !== 'dreamzz_admin_clear_2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Clear all stored links
    const beforeCount = linkStorage.getAll().length
    linkStorage.getAll().forEach(link => {
      linkStorage.delete(link.sessionId)
    })
    
    console.log(`🧹 Admin: Cleared ${beforeCount} stored sessions`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${beforeCount} sessions`,
      remaining: linkStorage.getAll().length
    })
  } catch (error) {
    console.error('Error clearing sessions:', error)
    return NextResponse.json({ error: 'Failed to clear sessions' }, { status: 500 })
  }
}