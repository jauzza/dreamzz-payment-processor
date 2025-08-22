import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()
    
    // Create a fake session ID for testing
    const fakeSessionId = `cs_test_${Math.random().toString(36).substring(7)}`
    
    return NextResponse.json({ sessionId: fakeSessionId })
  } catch (error) {
    console.error('Error creating test checkout session:', error)
    return NextResponse.json(
      { error: 'Error creating test checkout session' },
      { status: 500 }
    )
  }
}