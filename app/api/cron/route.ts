import { NextRequest, NextResponse } from 'next/server'

// This endpoint can be called by Vercel Cron or external services like cron-job.org
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Simple auth check (you can make this more secure)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'your-secret-key'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('⏰ Cron job triggered - checking for expired members')
    
    // Call the cleanup endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dreamzz.lol'
    const cleanupResponse = await fetch(`${baseUrl}/api/cleanup-expired`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await cleanupResponse.json()
    
    console.log('⏰ Cron cleanup result:', result)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cleanup: result
    })
    
  } catch (error: any) {
    console.error('❌ Cron job error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}