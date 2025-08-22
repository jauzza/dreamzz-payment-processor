'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, 
  Users, 
  MessageSquare, 
  Upload, 
  Settings, 
  Shield, 
  Calendar,
  BarChart3,
  FolderOpen,
  Package,
  LogOut,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Guild {
  id: string
  name: string
  icon: string
  permissions: number
}

interface BotStatus {
  status: string
  botName?: string
  botAvatar?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGuild, setSelectedGuild] = useState<string>('')
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (selectedGuild) {
      fetchBotStatus()
    }
  }, [selectedGuild])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        fetchGuilds()
      } else {
        router.push('/dashboard/login')
      }
    } catch (error) {
      router.push('/dashboard/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchGuilds = async () => {
    try {
      const response = await fetch('/api/dashboard/guilds', {
        credentials: 'include'
      })
      if (response.ok) {
        const guildsData = await response.json()
        setGuilds(guildsData)
        if (guildsData.length > 0 && !selectedGuild) {
          setSelectedGuild(guildsData[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch guilds:', error)
    }
  }

  const fetchBotStatus = async () => {
    if (!selectedGuild) return
    
    try {
      const response = await fetch(`/api/dashboard/bot/status/${selectedGuild}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const status = await response.json()
        setBotStatus(status)
      }
    } catch (error) {
      setBotStatus({ status: 'not_created' })
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      router.push('/dashboard/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getGuildIcon = (guild: Guild) => {
    if (guild.icon) {
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Dreamzz Dashboard</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Guild Selector */}
            {guilds.length > 0 && (
              <select
                value={selectedGuild}
                onChange={(e) => setSelectedGuild(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {guilds.map((guild) => (
                  <option key={guild.id} value={guild.id}>
                    {guild.name}
                  </option>
                ))}
              </select>
            )}
            
            {/* User Info */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.username?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Overview</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('verification')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'verification' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Payment Verification</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'upload' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Video Upload</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('announcements')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'announcements' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Announcements</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('moderation')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'moderation' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Moderation</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bot Status</CardTitle>
                    <CardDescription>Current status of your Discord bot</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {botStatus ? (
                      <div className="flex items-center space-x-4">
                        <Badge variant={botStatus.status === 'online' ? 'default' : 'secondary'}>
                          {botStatus.status === 'online' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Online
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Offline
                            </>
                          )}
                        </Badge>
                        {botStatus.botName && (
                          <span className="text-sm text-muted-foreground">
                            {botStatus.botName}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Loading bot status...</p>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,234</div>
                      <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">892</div>
                      <p className="text-xs text-muted-foreground">
                        +12.3% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">€2,847</div>
                      <p className="text-xs text-muted-foreground">
                        +8.2% from last month
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Verification</CardTitle>
                  <CardDescription>Manage payment verification codes and member access</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Verification System</h3>
                        <p className="text-sm text-muted-foreground">
                          Codes are generated automatically when payments are completed
                        </p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Monthly Members</h4>
                        <p className="text-2xl font-bold text-green-600">156</p>
                        <p className="text-sm text-muted-foreground">Active subscriptions</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Lifetime Members</h4>
                        <p className="text-2xl font-bold text-blue-600">89</p>
                        <p className="text-sm text-muted-foreground">Permanent access</p>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      View Verification Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'upload' && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Upload</CardTitle>
                  <CardDescription>Upload and manage video content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Video upload functionality coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'announcements' && (
              <Card>
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Manage server announcements</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Announcement system coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'moderation' && (
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Panel</CardTitle>
                  <CardDescription>Manage server moderation settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Moderation panel coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Settings</CardTitle>
                  <CardDescription>Configure your dashboard preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Settings panel coming soon...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 