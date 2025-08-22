import { NextRequest, NextResponse } from 'next/server'
import { discordVerificationStorage } from '@/lib/discord-verification-storage'

export async function GET(request: NextRequest) {
  try {
    const codes = discordVerificationStorage.getAllCodes()
    
    return NextResponse.json({
      count: codes.length,
      codes: codes.map(code => ({
        code: code.code,
        plan: code.plan,
        email: code.email,
        used: code.used,
        createdAt: new Date(code.createdAt).toISOString(),
        discordUserId: code.discordUserId
      }))
    })
  } catch (error) {
    console.error('Error getting Discord codes:', error)
    return NextResponse.json({ 
      error: 'Failed to get codes' 
    }, { status: 500 })
  }
}