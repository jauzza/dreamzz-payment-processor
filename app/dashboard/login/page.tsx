'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Shield, Users, Settings } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect(() => {
    if (code) {
      handleOAuthCallback(code)
    }
  }, [code])

  const handleOAuthCallback = async (code: string) => {
    try {
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        console.error('OAuth callback failed')
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
    }
  }

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    const redirectUri = encodeURIComponent(`${window.location.origin}/dashboard/login`)
    const scope = 'identify guilds'
    
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
    
    window.location.href = authUrl
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Dreamzz Dashboard</CardTitle>
          <CardDescription>
            Sign in with Discord to access your bot dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full"
            size="lg"
          >
            <Bot className="mr-2 h-4 w-4" />
            Continue with Discord
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>You'll be redirected to Discord to authorize access</p>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure OAuth authentication</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Access to your Discord servers</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span>Manage bot settings and features</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 