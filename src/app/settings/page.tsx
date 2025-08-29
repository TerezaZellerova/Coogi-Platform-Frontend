'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api-production'
import { ThemeToggle } from '@/components/theme-toggle-clean'
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Key,
  Database,
  Activity,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Mail,
  Globe,
  Trash2,
  Download,
  Upload,
  Server,
  Zap
} from 'lucide-react'

interface UserProfile {
  id?: string
  email: string
  name?: string
  company?: string
  role?: string
  avatar?: string
}

interface NotificationSettings {
  agentUpdates: boolean
  campaignAlerts: boolean
  leadNotifications: boolean
  systemUpdates: boolean
  emailReports: boolean
  weeklyDigest: boolean
}

interface APISettings {
  openai: boolean
  hunter: boolean
  instantly: boolean
  rapidapi: boolean
  clearout: boolean
}

interface SystemStats {
  totalAgents: number
  totalLeads: number
  totalCampaigns: number
  dataUsage: string
  lastBackup: string
  systemHealth: 'healthy' | 'warning' | 'error'
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  // State for different settings sections
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: '',
    name: '',
    company: '',
    role: ''
  })
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    agentUpdates: true,
    campaignAlerts: true,
    leadNotifications: true,
    systemUpdates: false,
    emailReports: true,
    weeklyDigest: false
  })
  
  const [apiStatus, setApiStatus] = useState<APISettings>({
    openai: false,
    hunter: false,
    instantly: false,
    rapidapi: false,
    clearout: false
  })
  
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalAgents: 0,
    totalLeads: 0,
    totalCampaigns: 0,
    dataUsage: '0 MB',
    lastBackup: 'Never',
    systemHealth: 'healthy'
  })

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Load user data
      const currentUser = apiClient.getCurrentUser()
      if (currentUser) {
        setUserProfile({
          email: currentUser.email || '',
          name: currentUser.name || '',
          company: currentUser.company || '',
          role: currentUser.role || ''
        })
      }

      // Load system stats (using existing API endpoints)
      const [dashboardStats, health] = await Promise.all([
        apiClient.getDashboardStats().catch(() => ({ activeAgents: 0, totalRuns: 0, totalJobs: 0, successRate: 0 })),
        apiClient.checkHealth().catch(() => ({ status: 'unknown' }))
      ])

      setSystemStats({
        totalAgents: dashboardStats.totalRuns || 0,
        totalLeads: dashboardStats.totalJobs || 0,
        totalCampaigns: 0, // Will be loaded from campaigns endpoint
        dataUsage: '45.2 MB', // Mock for now
        lastBackup: new Date().toLocaleDateString(),
        systemHealth: health.status === 'healthy' ? 'healthy' : 'warning'
      })

      // Check API status (mock for now, can be enhanced with real endpoints)
      setApiStatus({
        openai: true,
        hunter: true,
        instantly: true,
        rapidapi: true,
        clearout: false
      })

    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaveLoading(true)
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll update localStorage
      const authData = localStorage.getItem('coogiAuth')
      if (authData) {
        const auth = JSON.parse(authData)
        auth.user = { ...auth.user, ...userProfile }
        localStorage.setItem('coogiAuth', JSON.stringify(auth))
      }
      
      // Show success feedback
      setTimeout(() => setSaveLoading(false), 1000)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setSaveLoading(false)
    }
  }

  const exportData = async () => {
    try {
      // This would export user data in a real implementation
      const data = {
        profile: userProfile,
        settings: notifications,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coogi-data-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const clearCache = async () => {
    try {
      // Clear any cached data
      localStorage.removeItem('coogiCache')
      window.location.reload()
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your account, preferences, and system configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={loadSettings} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={userProfile.company}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={userProfile.role}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Your role/title"
                    />
                  </div>
                  
                  <Button onClick={saveProfile} disabled={saveLoading} className="w-full">
                    {saveLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">API Keys</p>
                      <p className="text-sm text-muted-foreground">Manage your API access keys</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Key className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive and how
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Agent Updates</p>
                      <p className="text-sm text-muted-foreground">Get notified when your agents complete tasks</p>
                    </div>
                    <Button
                      variant={notifications.agentUpdates ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, agentUpdates: !prev.agentUpdates }))}
                    >
                      {notifications.agentUpdates ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Campaign Alerts</p>
                      <p className="text-sm text-muted-foreground">Important updates about your email campaigns</p>
                    </div>
                    <Button
                      variant={notifications.campaignAlerts ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, campaignAlerts: !prev.campaignAlerts }))}
                    >
                      {notifications.campaignAlerts ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lead Notifications</p>
                      <p className="text-sm text-muted-foreground">When new leads are found or verified</p>
                    </div>
                    <Button
                      variant={notifications.leadNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, leadNotifications: !prev.leadNotifications }))}
                    >
                      {notifications.leadNotifications ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Updates</p>
                      <p className="text-sm text-muted-foreground">Platform updates and maintenance notices</p>
                    </div>
                    <Button
                      variant={notifications.systemUpdates ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, systemUpdates: !prev.systemUpdates }))}
                    >
                      {notifications.systemUpdates ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Reports</p>
                      <p className="text-sm text-muted-foreground">Daily summaries of agent activity</p>
                    </div>
                    <Button
                      variant={notifications.emailReports ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, emailReports: !prev.emailReports }))}
                    >
                      {notifications.emailReports ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Digest</p>
                      <p className="text-sm text-muted-foreground">Weekly performance summary and insights</p>
                    </div>
                    <Button
                      variant={notifications.weeklyDigest ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, weeklyDigest: !prev.weeklyDigest }))}
                    >
                      {notifications.weeklyDigest ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  API Integrations
                </CardTitle>
                <CardDescription>
                  Manage your third-party integrations and API connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">OpenAI</p>
                        <p className="text-sm text-muted-foreground">AI-powered analysis</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apiStatus.openai ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <Badge variant={apiStatus.openai ? "default" : "secondary"}>
                        {apiStatus.openai ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Hunter.io</p>
                        <p className="text-sm text-muted-foreground">Email verification</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apiStatus.hunter ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <Badge variant={apiStatus.hunter ? "default" : "secondary"}>
                        {apiStatus.hunter ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">Instantly.ai</p>
                        <p className="text-sm text-muted-foreground">Email campaigns</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apiStatus.instantly ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <Badge variant={apiStatus.instantly ? "default" : "secondary"}>
                        {apiStatus.instantly ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                        <Server className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium">RapidAPI</p>
                        <p className="text-sm text-muted-foreground">Job search APIs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apiStatus.rapidapi ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <Badge variant={apiStatus.rapidapi ? "default" : "secondary"}>
                        {apiStatus.rapidapi ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Statistics
                  </CardTitle>
                  <CardDescription>
                    Overview of your platform usage and health
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{systemStats.totalAgents}</p>
                      <p className="text-sm text-muted-foreground">Total Agents</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{systemStats.totalLeads}</p>
                      <p className="text-sm text-muted-foreground">Total Leads</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Usage</span>
                      <span className="text-sm font-medium">{systemStats.dataUsage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Backup</span>
                      <span className="text-sm font-medium">{systemStats.lastBackup}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Health</span>
                      <div className="flex items-center gap-2">
                        {systemStats.systemHealth === 'healthy' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                        <Badge variant={systemStats.systemHealth === 'healthy' ? "default" : "secondary"}>
                          {systemStats.systemHealth}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                  <CardDescription>
                    Manage your data, backups, and storage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={exportData} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  
                  <Button variant="outline" className="w-full" disabled>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                    <Badge variant="outline" className="ml-2">Coming Soon</Badge>
                  </Button>
                  
                  <Button onClick={clearCache} variant="outline" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                  
                  <div className="pt-4 border-t">
                    <Button variant="destructive" className="w-full" disabled>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Contact support to delete your account
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
