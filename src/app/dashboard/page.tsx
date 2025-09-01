'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { apiClient, type Agent, type DashboardStats, type Campaign, type ProgressiveAgent } from '@/lib/api-production'
import { useAgentMonitoring } from '@/hooks/useAgentMonitoring'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'
import AgentLaunchModal from '@/components/AgentLaunchModal'
import LeadManagement from '@/components/LeadManagement'
import CampaignManagement from '@/components/CampaignManagement'
import SubscriptionDashboard from '@/components/SubscriptionDashboard'
import { 
  Users, 
  TrendingUp, 
  Briefcase, 
  Activity, 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw,
  Mail,
  ExternalLink,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  BarChart3,
  Menu,
  X,
  Rocket,
  Crown
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle-clean'
import { CoogiLogo } from '@/components/ui/coogi-logo'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [backendConnected, setBackendConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('agents')
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: user?.name || 'User',
    email: user?.email || 'user@coogi.dev',
    avatar: ''
  })
  
  const [stats, setStats] = useState<DashboardStats>({
    activeAgents: 0,
    totalRuns: 0,
    totalJobs: 0,
    successRate: 0
  })
  
  const [query, setQuery] = useState('')
  const [hoursOld, setHoursOld] = useState('24')
  const [customTags, setCustomTags] = useState('')
  const [showAgentLaunchModal, setShowAgentLaunchModal] = useState(false)

  // Real-time agent monitoring
  const {
    agents,
    logs,
    statuses,
    addAgent,
    removeAgent,
    stopAllMonitoring
  } = useAgentMonitoring({
    enabled: isAuthenticated,
    onStatusChange: (agent, status) => {
      addToast({
        type: status.status === 'completed' ? 'success' : 
              status.status === 'failed' ? 'error' : 'info',
        title: `Agent ${agent.query}`,
        message: `Status: ${status.status}`,
        duration: 4000
      })
    }
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCompletedAgents, setShowCompletedAgents] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Filter agents based on current state
  const filteredAgents = agents.filter(agent => {
    // Always show running/processing agents
    if (agent.status === 'running' || agent.status === 'processing' || agent.status === 'initializing') {
      return true
    }
    
    // Show completed/failed agents only if user wants to see them
    if (agent.status === 'completed' || agent.status === 'failed') {
      return showCompletedAgents
    }
    
    return true
  })

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadDashboardData()
        loadUserProfile()
      } else {
        // If not authenticated, still set loading to false so we can show login form
        setLoading(false)
      }
    }
  }, [isAuthenticated, authLoading])

  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      loadDashboardData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'leads') {
      setActiveTab('leads')
    } else if (tab === 'campaigns') {
      setActiveTab('campaigns')
    } else if (tab === 'agents') {
      setActiveTab('agents')
    } else if (tab === 'debug') {
      setActiveTab('debug')
    }
  }, [searchParams])

  const handleLogout = async () => {
    logout()
  }

  const checkBackendConnection = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
      const response = await fetch(`${apiBase}/`)
      const data = await response.json()
      setBackendConnected(data.status === 'healthy')
    } catch (error) {
      console.error('Backend connection check failed:', error)
      setBackendConnected(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      // Check backend connection first
      await checkBackendConnection()
      
      // Load stats (this should always work as it doesn't require auth)
      try {
        const statsData = await apiClient.getDashboardStats()
        setStats(statsData)
        console.log('✅ Dashboard stats loaded:', statsData)
      } catch (statsError) {
        console.error('❌ Failed to load dashboard stats:', statsError)
      }
      
      // Load progressive agents (modern agent system)
      try {
        // Get raw progressive agent data with correct typing
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001'}/api/agents/progressive`)
        const progressiveAgentsData: ProgressiveAgent[] = await response.json()
        
        // Add progressive agents to monitoring (map to compatible agent format)
        progressiveAgentsData.forEach(progressiveAgent => {
          // Map progressive agent statuses to dashboard agent statuses
          let dashboardStatus: Agent['status'] = 'failed'
          switch (progressiveAgent.status) {
            case 'initializing':
              dashboardStatus = 'initializing'
              break
            case 'linkedin_stage':
              dashboardStatus = 'running'
              break
            case 'enrichment_stage':
              dashboardStatus = 'processing'
              break
            case 'completed':
              dashboardStatus = 'completed'
              break
            case 'failed':
              dashboardStatus = 'failed'
              break
          }
          
          // Show active and completed agents in dashboard
          if (dashboardStatus === 'running' || dashboardStatus === 'processing' || 
              dashboardStatus === 'initializing' || dashboardStatus === 'completed') {
            // Convert ProgressiveAgent to Agent format for dashboard compatibility
            const dashboardAgent: Agent = {
              id: progressiveAgent.id,
              query: progressiveAgent.query,
              status: dashboardStatus,
              created_at: progressiveAgent.created_at,
              updated_at: progressiveAgent.updated_at,
              total_jobs_found: progressiveAgent.staged_results?.total_jobs || 0,
              total_emails_found: progressiveAgent.staged_results?.total_contacts || 0,
              hours_old: progressiveAgent.hours_old,
              custom_tags: progressiveAgent.custom_tags,
              batch_id: progressiveAgent.id,
              staged_results: progressiveAgent.staged_results
            }
            addAgent(dashboardAgent)
          }
        })
        console.log('✅ Progressive agents loaded:', progressiveAgentsData.length)
        
        // Also try to load legacy agents for compatibility
        try {
          const legacyAgentsData = await apiClient.getAgents()
          legacyAgentsData.forEach(agent => {
            if (agent.status === 'running' || agent.status === 'processing') {
              addAgent(agent)
            }
          })
          console.log('✅ Legacy agents loaded:', legacyAgentsData.length)
        } catch (legacyError) {
          console.warn('⚠️ Legacy agents endpoint failed (expected):', legacyError)
        }
      } catch (agentsError) {
        console.warn('⚠️ Failed to load progressive agents:', agentsError)
        // Don't set backendConnected to false just because agents failed
      }
      
    } catch (error) {
      console.error('❌ Critical error loading dashboard data:', error)
      setBackendConnected(false)
    } finally {
      // Always set loading to false after attempting to load data
      setLoading(false)
    }
  }

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setActionLoading('create')
    try {
      // Use progressive agent creation instead of the old endpoint
      const response = await apiClient.createProgressiveAgent(
        query.trim(), 
        parseInt(hoursOld), 
        customTags.trim() || undefined,
        'hiring_managers', // default target type
        'all', // default company size - will be configurable in UI
        undefined // no location filter for basic form
      )
      
      // Add to monitoring system - convert ProgressiveAgent to Agent format
      const agentForMonitoring: Agent = {
        id: response.agent.id,
        query: response.agent.query,
        status: response.agent.status === 'linkedin_stage' ? 'running' : 
                response.agent.status === 'enrichment_stage' ? 'processing' : 
                response.agent.status,
        created_at: response.agent.created_at,
        updated_at: response.agent.updated_at,
        total_jobs_found: response.agent.staged_results?.total_jobs || 0,
        total_emails_found: response.agent.staged_results?.total_contacts || 0,
        hours_old: response.agent.hours_old,
        custom_tags: response.agent.custom_tags,
        batch_id: response.agent.id
      }
      
      addAgent(agentForMonitoring)
      
      setQuery('')
      setCustomTags('')
      
      addToast({
        type: 'success',
        title: 'Agent Created',
        message: `Started progressive agent: ${response.agent.query}`,
        duration: 4000
      })
      
      // Reload stats
      const newStats = await apiClient.getDashboardStats()
      setStats(newStats)
    } catch (error) {
      console.error('Error creating agent:', error)
      let errorMessage = 'Failed to create agent. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('timed out')) {
          errorMessage = 'Agent creation is taking longer than expected. It may still be processing in the background.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      }
      
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
        duration: 8000
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Modal handlers
  const handleAgentCreated = (agent: any) => {
    // Add to monitoring system
    addAgent(agent)
    
    addToast({
      type: 'success',
      title: 'Agent Started',
      message: `Searching for "${agent.query}" opportunities`,
      duration: 4000
    })
    
    // Reload dashboard data
    loadDashboardData()
  }

  const handleModalError = (error: string) => {
    addToast({
      type: 'error',
      title: 'Agent Creation Failed',
      message: error,
      duration: 8000
    })
  }

  const handleAgentAction = async (agentId: string, action: 'pause' | 'resume' | 'delete') => {
    setActionLoading(agentId)
    try {
      if (action === 'delete') {
        await apiClient.deleteAgent(agentId)
        removeAgent(agentId)
        
        addToast({
          type: 'success',
          title: 'Agent Deleted',
          message: 'Agent has been removed successfully',
          duration: 3000
        })
      } else {
        // Use the new API methods for pause/resume
        const batchId = agents.find(a => a.id === agentId)?.batch_id || agentId
        
        if (action === 'pause') {
          await apiClient.pauseAgent(batchId)
        } else {
          await apiClient.resumeAgent(batchId)
        }
        
        addToast({
          type: 'success',
          title: `Agent ${action === 'pause' ? 'Paused' : 'Resumed'}`,
          message: `Agent has been ${action === 'pause' ? 'paused' : 'resumed'} successfully`,
          duration: 3000
        })
      }
      
      // Reload stats
      const newStats = await apiClient.getDashboardStats()
      setStats(newStats)
    } catch (error) {
      console.error(`Error performing ${action} on agent:`, error)
      addToast({
        type: 'error',
        title: 'Error',
        message: `Failed to ${action} agent. Please try again.`,
        duration: 5000
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: Agent['status']) => {
    const variants = {
      running: 'default',
      paused: 'secondary',
      completed: 'outline',
      failed: 'destructive',
      processing: 'default',
      initializing: 'secondary',
      enrichment_stage: 'default'
    }
    return <Badge variant={variants[status] as any}>{status}</Badge>
  }

  const loadUserProfile = () => {
    try {
      // Load from localStorage first
      const savedProfile = localStorage.getItem('userProfile')
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile)
        setUserProfile({
          name: profileData.name || 'User',
          email: profileData.email || 'user@coogi.dev',
          avatar: profileData.avatar || ''
        })
        return
      }

      // Fallback to API client
      const currentUser = apiClient.getCurrentUser()
      if (currentUser) {
        setUserProfile({
          name: currentUser.name || 'User',
          email: currentUser.email || 'user@coogi.dev',
          avatar: ''
        })
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      loadUserProfile()
    }

    // Listen for storage changes (in case profile is updated in another tab)
    window.addEventListener('storage', handleProfileUpdate)
    
    // Custom event for profile updates within the same tab
    window.addEventListener('profileUpdated', handleProfileUpdate)

    return () => {
      window.removeEventListener('storage', handleProfileUpdate)
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [])

  useEffect(() => {
    loadUserProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Show login form if not authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccessAction={() => window.location.reload()} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CoogiLogo size="md" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">Lead Generation Platform</p>
              </div>
            </div>
            <nav className="flex items-center space-x-3" role="navigation" aria-label="Main navigation">
              {/* Backend Status Indicator */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all border ${
                backendConnected 
                  ? 'bg-muted text-foreground border-border' 
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`} role="status" aria-label={`Backend connection status: ${backendConnected ? 'Connected' : 'Offline'}`}>
                {backendConnected ? (
                  <>
                    <Wifi className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm font-medium hidden md:inline">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm font-medium hidden md:inline">Offline</span>
                  </>
                )}
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-2">
                <ThemeToggle />
                
                {/* Development Toast Test Button */}
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const types = ['success', 'error', 'warning', 'info'] as const
                      const type = types[Math.floor(Math.random() * types.length)]
                      addToast({
                        type,
                        title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                        message: `This is a test ${type} notification to verify dark mode contrast`,
                        duration: 6000
                      })
                    }}
                    className="text-xs"
                    aria-label="Test toast notifications"
                  >
                    🧪 Test Toast
                  </Button>
                )}
                
                <Button variant="outline" size="sm" onClick={() => router.push('/analytics')} aria-label="Go to Analytics page">
                  <BarChart3 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Analytics
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('subscription')} aria-label="Go to Subscription management">
                  <Crown className="w-4 h-4 mr-2" aria-hidden="true" />
                  Subscription
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/agents')} aria-label="Go to Agents page">
                  <Users className="w-4 h-4 mr-2" aria-hidden="true" />
                  Agents
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/settings')} aria-label="Go to Settings page">
                  <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                  Settings
                </Button>
              </div>

              {/* User Profile Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-3 px-4 py-2 h-auto glass-card border-border hover:bg-muted transition-all duration-200"
                aria-label="Go to user profile"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center overflow-hidden" aria-hidden="true">
                  {userProfile.avatar ? (
                    <img 
                      src={userProfile.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-white">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  {userProfile.name}
                </span>
              </Button>

              {/* Mobile Menu Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" aria-hidden="true" /> : <Menu className="w-4 h-4" aria-hidden="true" />}
              </Button>

              {/* Logout Button */}
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex" aria-label="Sign out">
                <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg animate-slide-in"
          role="navigation"
          aria-label="Mobile navigation menu"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start btn-hover" 
              onClick={() => {
                setActiveTab('subscription')
                setMobileMenuOpen(false)
              }}
              aria-label="Go to Subscription management"
            >
              <Crown className="w-4 h-4 mr-3" aria-hidden="true" />
              Subscription & Billing
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start btn-hover" 
              onClick={() => {
                router.push('/analytics')
                setMobileMenuOpen(false)
              }}
              aria-label="Go to Analytics page"
            >
              <BarChart3 className="w-4 h-4 mr-3" aria-hidden="true" />
              Analytics & Insights
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start btn-hover" 
              onClick={() => {
                router.push('/agents')
                setMobileMenuOpen(false)
              }}
              aria-label="Go to Agents page"
            >
              <Users className="w-4 h-4 mr-3" aria-hidden="true" />
              Agent Manager
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start btn-hover" 
              onClick={() => {
                router.push('/settings')
                setMobileMenuOpen(false)
              }}
              aria-label="Go to Settings page"
            >
              <Settings className="w-4 h-4 mr-3" aria-hidden="true" />
              Settings
            </Button>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 btn-hover" 
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4 mr-3" aria-hidden="true" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" role="main">
        {/* Stats Header */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" aria-labelledby="dashboard-title">
          <div>
            <h2 id="dashboard-title" className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-1">Real-time insights into your lead generation</p>
          </div>
          <Button
            variant="outline"
            size="default"
            onClick={loadDashboardData}
            disabled={loading}
            className="shadow-sm btn-hover focus-ring"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh Data
          </Button>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-labelledby="stats-section">
          <h3 id="stats-section" className="sr-only">Platform Statistics</h3>
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 card-premium animate-card-entrance" role="article" aria-labelledby="active-agents-title" style={{animationDelay: '0ms'}}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 animate-float" aria-hidden="true"></div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse-glow"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle id="active-agents-title" className="text-sm font-semibold text-blue-700 dark:text-blue-300">Active Agents</CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg" aria-hidden="true">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1" aria-label={`${stats.activeAgents} active agents`}>{stats.activeAgents}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                Currently searching for leads
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 card-premium animate-card-entrance" style={{animationDelay: '100ms'}}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 animate-float" aria-hidden="true" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse-glow"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Total Runs</CardTitle>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">{stats.totalRuns}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                Agent searches completed
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 card-premium animate-card-entrance" style={{animationDelay: '200ms'}}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12 animate-float" aria-hidden="true" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse-glow"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Jobs Found</CardTitle>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">{stats.totalJobs.toLocaleString()}</div>
              <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                Total job opportunities
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 card-premium animate-card-entrance" style={{animationDelay: '300ms'}}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -mr-12 -mt-12 animate-float" aria-hidden="true" style={{animationDelay: '3s'}}></div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-pulse-glow"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">Success Rate</CardTitle>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1">{stats.successRate}%</div>
              <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                Email verification rate
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main Content */}
        <section aria-labelledby="main-content-section">
          <h3 id="main-content-section" className="sr-only">Main Dashboard Content</h3>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl" role="tablist" aria-label="Dashboard sections">
              <TabsTrigger value="agents" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm text-contrast-medium data-[state=active]:text-contrast-high" role="tab">
                Agent Management
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm text-contrast-medium data-[state=active]:text-contrast-high" role="tab">
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="leads" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm text-contrast-medium data-[state=active]:text-contrast-high" role="tab">
                Lead Database
              </TabsTrigger>
              <TabsTrigger value="subscription" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm text-contrast-medium data-[state=active]:text-contrast-high" role="tab">
                <Crown className="w-4 h-4 mr-2 sm:inline hidden" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="debug" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm text-contrast-medium data-[state=active]:text-contrast-high" role="tab">
                API Debug
              </TabsTrigger>
            </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Agent Creator */}
              <Card className="xl:col-span-1 shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl flex items-center gap-2 card-title-enhanced">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    Create New Agent
                  </CardTitle>
                  <CardDescription className="text-base text-description">
                    Launch a powerful lead generation agent with real-time progress tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-purple-500" />
                      Next-Generation Agent System
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• LinkedIn jobs in 2-3 minutes</li>
                      <li>• Multi-platform job search</li>
                      <li>• Automated contact discovery</li>
                      <li>• Personalized campaign creation</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={() => setShowAgentLaunchModal(true)}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200" 
                  >
                    Launch Your Agent
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Get started in seconds • Real-time progress tracking • Professional results
                  </p>
                </CardContent>
              </Card>

              {/* Active Agents */}
              <Card className="xl:col-span-2 shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-xl card-title-enhanced">Active Agents</CardTitle>
                    <CardDescription className="text-base mt-1 text-description">
                      Monitor and manage your lead generation agents
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadDashboardData} className="shadow-sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Show/Hide Completed Agents Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">Active Agents</span>
                        <Badge variant="secondary">{filteredAgents.length}</Badge>
                      </div>
                      {agents.some(agent => agent.status === 'completed' || agent.status === 'failed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCompletedAgents(!showCompletedAgents)}
                          className="text-xs"
                        >
                          {showCompletedAgents ? 'Hide' : 'Show'} Completed
                        </Button>
                      )}
                    </div>
                    
                    {filteredAgents.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-contrast-medium mb-2">
                          {agents.length === 0 ? 'No Active Agents' : 'No Active Agents'}
                        </h3>
                        <p className="text-muted-enhanced">
                          {agents.length === 0 
                            ? 'Create your first agent to start generating leads'
                            : showCompletedAgents 
                              ? 'All agents have completed'
                              : 'All agents have completed. Show completed agents to view results.'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredAgents.map((agent) => (
                          <div
                            key={agent.id}
                            className="group relative flex items-center justify-between p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                  <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{agent.query}</h4>
                                  {getStatusBadge(agent.status)}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Briefcase className="w-4 h-4 text-purple-500" />
                                  <span className="text-slate-600 dark:text-slate-400">
                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                      {((agent.staged_results?.linkedin_jobs?.length || 0) + 
                                        (agent.staged_results?.other_jobs?.length || 0))}
                                    </span> jobs found
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-green-500" />
                                  <span className="text-slate-600 dark:text-slate-400">
                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                      {agent.staged_results?.verified_contacts?.length || 0}
                                    </span> emails verified
                                  </span>
                                </div>
                              </div>
                              {agent.custom_tags && (
                                <div className="mt-3">
                                  <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(agent.custom_tags) 
                                      ? agent.custom_tags 
                                      : agent.custom_tags.split(',')
                                    ).map((tag, index) => (
                                      <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                        {typeof tag === 'string' ? tag.trim() : tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                              {agent.status === 'running' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAgentAction(agent.id, 'pause')}
                                  disabled={actionLoading === agent.id}
                                  className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
                                >
                                  <Pause className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAgentAction(agent.id, 'resume')}
                                  disabled={actionLoading === agent.id}
                                  className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAgentAction(agent.id, 'delete')}
                                disabled={actionLoading === agent.id}
                                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <CampaignManagement />
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <LeadManagement />
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionDashboard />
          </TabsContent>

          {/* Debug Tab */}
          <TabsContent value="debug" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Debug & Connection Test</CardTitle>
                <CardDescription>
                  Test backend connectivity and API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Backend Status</h4>
                    <div className="flex items-center space-x-2">
                      {backendConnected ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Connected to {process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-red-600">Disconnected from {process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Quick Actions</h4>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => checkBackendConnection()}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open('/test-api', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Full API Test
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </section>
      </main>

      {/* Agent Launch Modal */}
      <AgentLaunchModal
        isOpen={showAgentLaunchModal}
        onCloseAction={() => setShowAgentLaunchModal(false)}
        onAgentCreatedAction={handleAgentCreated}
        onErrorAction={handleModalError}
      />
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p>Loading dashboard...</p>
      </div>
    </div>}>
      <DashboardContent />
    </Suspense>
  )
}
