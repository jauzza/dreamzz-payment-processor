import { NextRequest, NextResponse } from 'next/server'
import { sessionStorage } from '@/lib/session-storage'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Mark session as viewed
    sessionStorage.markAsViewed(sessionId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking session as viewed:', error)
    return NextResponse.json({ error: 'Failed to mark session' }, { status: 500 })
  }
}