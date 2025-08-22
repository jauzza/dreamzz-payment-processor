import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { guildId: string } }
) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('discord_session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    const sessionData = JSON.parse(sessionCookie.value)
    const { guildId } = params

    // For now, return a mock status
    // In the future, this would check if the bot is actually online in the guild
    const botStatus = {
      status: 'online', // or 'offline', 'not_created'
      botName: 'Dreamzz Bot',
      botAvatar: null
    }

    return NextResponse.json(botStatus)
  } catch (error) {
    console.error('Bot status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 