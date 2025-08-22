import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('discord_session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    const sessionData = JSON.parse(sessionCookie.value)

    // Return the guilds from the session
    return NextResponse.json(sessionData.guilds || [])
  } catch (error) {
    console.error('Guilds API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 