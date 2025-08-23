import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const DISCORD_CLIENT_ID = '1404275438532038789' // Your current Discord Client ID
const DISCORD_CLIENT_SECRET = '26yeMsVD1spP7jC6jsA6w5iDQ_5TZwTe' // Your current Discord Client Secret

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID!,
        client_secret: DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `https://dreamzz.lol/dashboard/login`,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to get user info' }, { status: 400 })
    }

    const userData = await userResponse.json()

    // Get user guilds
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    let guilds = []
    if (guildsResponse.ok) {
      guilds = await guildsResponse.json()
    }

    // Create minimal session data to fit in cookie (under 4096 chars)
    const sessionData = {
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
    }

    // Set session cookie (in production, use a proper session store)
    const cookieStore = await cookies()
    const sessionString = JSON.stringify(sessionData)
    console.log('🍪 Setting session cookie:', {
      user: userData.username,
      expiresAt: new Date(sessionData.expiresAt).toISOString(),
      sessionLength: sessionString.length
    })
    
    if (sessionString.length > 4000) {
      console.error('❌ Session data too large:', sessionString.length, 'characters')
      return NextResponse.json({ error: 'Session data too large' }, { status: 500 })
    }
    
    cookieStore.set('discord_session', sessionString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log('✅ Session cookie set successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 