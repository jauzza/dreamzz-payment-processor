import { NextRequest, NextResponse } from 'next/server'
import { discordVerificationStorage } from '@/lib/discord-verification-storage'

export async function POST(request: NextRequest) {
  try {
    // Simple admin authentication
    const { secret } = await request.json()
    
    if (secret !== 'dreamzz_clear_codes_2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const beforeCount = discordVerificationStorage.getAllCodes().length
    discordVerificationStorage.clearAll()
    
    console.log(`🧹 Cleared ${beforeCount} verification codes`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${beforeCount} verification codes`,
      remaining: discordVerificationStorage.getAllCodes().length
    })
  } catch (error) {
    console.error('Error clearing codes:', error)
    return NextResponse.json({ 
      error: 'Failed to clear codes' 
    }, { status: 500 })
  }
} 