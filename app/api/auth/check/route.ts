import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('discord_session')

    console.log('🔍 Auth check - Session cookie found:', !!sessionCookie)
    if (sessionCookie) {
      console.log('🔍 Auth check - Cookie value length:', sessionCookie.value.length)
    }

    if (!sessionCookie) {
      console.log('❌ Auth check - No session cookie found')
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    const sessionData = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
      // Try to refresh the token
      const refreshResult = await refreshAccessToken(sessionData.refreshToken)
      
      if (refreshResult.success) {
        // Update session with new tokens
        const updatedSessionData = {
          ...sessionData,
          accessToken: refreshResult.access_token,
          refreshToken: refreshResult.refresh_token,
          expiresAt: Date.now() + (refreshResult.expires_in * 1000),
        }

        cookieStore.set('discord_session', JSON.stringify(updatedSessionData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        return NextResponse.json(updatedSessionData.user)
      } else {
        // Refresh failed, clear session
        cookieStore.delete('discord_session')
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }
    }

    return NextResponse.json(sessionData.user)
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '1404275438532038789',
        client_secret: '26yeMsVD1spP7jC6jsA6w5iDQ_5TZwTe',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (response.ok) {
      return { success: true, ...(await response.json()) }
    } else {
      return { success: false }
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    return { success: false }
  }
} 