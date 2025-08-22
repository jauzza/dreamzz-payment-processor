'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Background } from '@/components/background'
import { CheckCircle, Copy, ExternalLink, RefreshCw, ArrowLeft } from 'lucide-react'
import { DiscordImageIcon } from '@/components/icons/discord-image'
import { TelegramImageIcon } from '@/components/icons/telegram-image'

interface InviteLinks {
  discord?: string
  telegram?: string
  error?: string
  note?: string
  plan?: string
}

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const plan = searchParams.get('plan')
  
  const [links, setLinks] = useState<InviteLinks>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showManualButton, setShowManualButton] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [sessionValid, setSessionValid] = useState<boolean | null>(false)
  const [copied, setCopied] = useState<{ discord?: boolean; telegram?: boolean }>({})
  const [activeView, setActiveView] = useState<'main' | 'discord' | 'telegram'>('main')

  useEffect(() => {
    if (sessionId) {
      // First verify the session is valid - THIS MUST RUN FIRST
      const verifySession = async () => {
        try {
          const response = await fetch(`/api/verify-session?session_id=${sessionId}`)
          
          if (!response.ok) {
            // Session is invalid - show access denied immediately
            setSessionValid(false)
            setLoading(false)
            return
          }
          
          // Session is valid - proceed with normal flow
          setSessionValid(true)
          
          // Mark this session as viewed (one-time access)
          fetch('/api/mark-viewed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          })
          
          // Start polling for links after verification succeeds
          pollForLinks()
          
          // Set manual button timer
          const timer = setTimeout(() => {
            setShowManualButton(true)
          }, 10000)
          
          return () => {
            if (timer) {
              clearTimeout(timer)
            }
          }
        } catch (error) {
          console.error('Session verification failed:', error)
          setSessionValid(false)
          setLoading(false)
          return
        }
      }

      const pollForLinks = async (attempts = 0) => {
        const maxAttempts = 20 // Poll for up to 20 seconds
        try {
          const response = await fetch(`/api/get-links?session_id=${sessionId}`)
          
          if (response.ok) {
            const data = await response.json()
            setLinks({
              discord: data.discord,
              telegram: data.telegram,
              plan: data.plan
            })
            setLoading(false)
            setHasGenerated(true) // Consider auto-generated links as "generated"
          } else if (attempts < maxAttempts) {
            // Keep polling if under max attempts
            setTimeout(() => pollForLinks(attempts + 1), 1000)
          } else {
            // Max attempts reached, show error
            setLinks({ error: 'Links not found. Click the button below to generate them manually.' })
            setLoading(false)
          }
        } catch (error) {
          console.error('Error polling for links:', error)
          if (attempts < maxAttempts) {
            setTimeout(() => pollForLinks(attempts + 1), 1000)
          } else {
            setLinks({ error: 'Links not found. Click the button below to generate them manually.' })
            setLoading(false)
          }
        }
      }

      // Start verification immediately
      verifySession()
    } else {
      // No session ID provided
      setSessionValid(false)
      setLoading(false)
    }
  }, [sessionId, plan])

  const generateLinks = async () => {
    if (!sessionId || sessionValid !== true) return
    
    setGenerating(true)
    try {
      const response = await fetch('/api/test-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          amount: plan === 'lifetime' ? 3499 : 1499 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setLinks({
          discord: `https://discord.gg/DEMO-${Math.random().toString(36).substring(7)}`,
          telegram: data.telegramLink,
          plan: data.plan
        })
        setLoading(false)
        setHasGenerated(true)
      } else {
        const errorData = await response.json()
        setLinks({ error: errorData.error || 'Failed to generate links' })
        setLoading(false)
      }
    } catch (error) {
      console.error('Error generating links:', error)
      setLinks({ error: 'Failed to generate links. Please try again.' })
      setLoading(false)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'discord' | 'telegram') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied({ ...copied, [type]: true })
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openLink = (url: string) => {
    window.open(url, '_blank')
  }

  // Show access denied screen immediately if session validation fails
  if (sessionValid === false) {
    return (
      <main className="h-screen w-full">
        <div className="relative h-full w-full">
          <Background src="/snaptik_1948601182043471984-0.jpeg" />
          <div className="relative z-10 flex items-center justify-center h-full p-4">
            <div className="text-center max-w-md bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <div className="w-16 h-16 bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">🚫</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-3">Access Denied</h1>
              <p className="text-white/80 text-sm mb-6">
                This link is invalid, expired, or you don't have permission to access it.
              </p>
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Show loading screen while validating session or loading links
  if (loading || sessionValid === null) {
    return (
      <main className="h-screen w-full">
        <div className="relative h-full w-full">
          <Background src="/snaptik_1948601182043471984-0.jpeg" />
          <div className="relative z-10 flex items-center justify-center h-full p-4">
            <div className="text-center max-w-md bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              {generating ? (
                <>
                  <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white text-lg">Generating your exclusive invite links...</p>
                </>
              ) : (
                <>
                  <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white text-lg mb-6">{sessionValid === null ? 'Verifying access...' : 'Generating your exclusive invite links...'}</p>
                  {showManualButton && !generating && sessionValid === true && (
                    <>
                      <p className="text-white/70 text-sm mb-6">Taking too long? Generate your links now.</p>
                      <Button
                        onClick={generateLinks}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                        disabled={generating}
                      >
                        Generate Links
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen w-full">
      <div className="relative h-full w-full">
        <Background src="/snaptik_1948601182043471984-0.jpeg" />
        
        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-full p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            
            {/* Main View - Choose Platform */}
            {activeView === 'main' && (
              <>
                <div className="text-center mb-6">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Payment Successful!
                  </h1>
                  <p className="text-white/80 text-sm">
                    Welcome to dreamzz! Choose your platform:
                  </p>
                  {plan && (
                    <p className="text-xs text-white/60 mt-2">
                      Plan: {plan === 'monthly' ? 'Monthly Membership - 32 days of access!' : 'Lifetime Membership'}
                    </p>
                  )}
                </div>

                {links.error ? (
                  <div className="text-center">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                      <p className="text-red-400 mb-4">{links.error}</p>
                      <Button
                        onClick={generateLinks}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                        disabled={generating}
                      >
                        {generating ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Discord Button */}
                    <Button
                      onClick={() => setActiveView('discord')}
                      className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white h-12 text-lg font-medium"
                    >
                      <DiscordImageIcon size={20} className="mr-3" />
                      Discord Server
                    </Button>

                    {/* Telegram Button */}
                    <Button
                      onClick={() => setActiveView('telegram')}
                      className="w-full bg-[#0088CC] hover:bg-[#0077B3] text-white h-12 text-lg font-medium"
                    >
                      <TelegramImageIcon size={20} className="mr-3" />
                      Telegram Channel
                    </Button>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <p className="text-white/60 text-xs mb-3">
                    ⚠️ These are one-time access links. Save them now or join immediately.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    Back to Home
                  </Button>
                </div>
              </>
            )}

            {/* Discord View */}
            {activeView === 'discord' && links.discord && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <DiscordImageIcon size={24} />
                    <h2 className="text-xl font-bold text-white">Discord Server Access</h2>
                  </div>
                  <Button
                    onClick={() => setActiveView('main')}
                    className="bg-white/20 hover:bg-white/30 text-white p-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-white/80 text-sm mb-4">
                  Get your premium role in our Discord server using the verification code below.
                </p>
                
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium text-sm mb-2">📋 How to get your premium role:</h4>
                  <ol className="text-white/70 text-xs space-y-1">
                    <li>1. Join our Discord server (if you haven't already)</li>
                    <li>2. Use the command: <code className="bg-white/20 px-1 rounded">/verify {links.discord}</code></li>
                    <li>3. You'll automatically get your premium role!</li>
                  </ol>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-white/60 text-xs block mb-1">Your Verification Code:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={links.discord}
                        readOnly
                        className="flex-1 bg-white/10 text-white px-3 py-2 border border-white/20 text-sm font-mono text-center font-bold tracking-wider rounded"
                      />
                      <Button
                        onClick={() => copyToClipboard(links.discord!, 'discord')}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-3"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => openLink('https://discord.gg/dreamzz')}
                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Discord Server
                  </Button>
                </div>
              </>
            )}

            {/* Telegram View */}
            {activeView === 'telegram' && links.telegram && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TelegramImageIcon size={24} />
                    <h2 className="text-xl font-bold text-white">Telegram Channel</h2>
                  </div>
                  <Button
                    onClick={() => setActiveView('main')}
                    className="bg-white/20 hover:bg-white/30 text-white p-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-white/80 text-sm mb-4">
                  Access our private Telegram channel for instant updates and exclusive content.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-white/60 text-xs block mb-1">Your Invite Link:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={links.telegram}
                        readOnly
                        className="flex-1 bg-white/10 text-white px-3 py-2 border border-white/20 text-sm font-mono rounded"
                      />
                      <Button
                        onClick={() => copyToClipboard(links.telegram!, 'telegram')}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-3"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => openLink(links.telegram!)}
                    className="w-full bg-[#0088CC] hover:bg-[#0077B3] text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Telegram Channel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="h-screen w-full">
        <div className="relative h-full w-full">
          <Background src="/snaptik_1948601182043471984-0.jpeg" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}