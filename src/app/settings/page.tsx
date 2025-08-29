'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api-production'
import { 
  ArrowLeft,
  Trash2,
  Database,
  Server,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Key,
  Globe
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [memoryStats, setMemoryStats] = useState<any>(null)
  const [backendHealth, setBackendHealth] = useState<any>(null)

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
      const [memory, health] = await Promise.all([
        apiClient.getMemoryStats(),
        apiClient.checkHealth()
      ])
      
      setMemoryStats(memory)
      setBackendHealth(health)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearMemory = async () => {
    if (!confirm('Are you sure you want to clear all memory data? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      await apiClient.clearMemory()
      alert('Memory cleared successfully')
      await loadSettings()
    } catch (error) {
      console.error('Error clearing memory:', error)
      alert('Failed to clear memory')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/dashboard')}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Settings & Configuration
                  </h1>
                  <p className="text-xs text-muted-foreground">Manage platform settings and system health</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={loadSettings} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Settings Tabs */}
        <Tabs defaultValue="system" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              System Health
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Security
            </TabsTrigger>
            <TabsTrigger value="database" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Database
            </TabsTrigger>
            <TabsTrigger value="apis" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              API Keys
            </TabsTrigger>
          </TabsList>

          {/* System Health Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Backend Status */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-500" />
                    Backend Status
                  </CardTitle>
                  <CardDescription>Service health and connectivity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {backendHealth ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Service Status</span>
                        <div className="flex items-center gap-2">
                          {backendHealth.status === 'healthy' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <Badge variant={backendHealth.status === 'healthy' ? 'default' : 'destructive'}>
                            {backendHealth.status || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                      {backendHealth.timestamp && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Last Check</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(backendHealth.timestamp).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">API Status</h4>
                        <div className="space-y-2">
                          {Object.entries(backendHealth.api_status || {}).map(([api, status]) => (
                            <div key={api} className="flex items-center justify-between">
                              <span className="text-sm">{api}</span>
                              <div className="flex items-center gap-2">
                                {status ? (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-500" />
                                )}
                                <Badge variant={status ? 'default' : 'secondary'} className="text-xs">
                                  {status ? 'Connected' : 'Disconnected'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Failed to load backend status</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Memory Statistics */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-500" />
                    Memory & Cache
                  </CardTitle>
                  <CardDescription>System memory usage and cache statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {memoryStats ? (
                    <div className="space-y-4">
                      {memoryStats.stats && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="text-lg font-bold">{memoryStats.stats.processed_jobs || 0}</div>
                            <p className="text-xs text-muted-foreground">Processed Jobs</p>
                          </div>
                          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="text-lg font-bold">{memoryStats.stats.total_companies || 0}</div>
                            <p className="text-xs text-muted-foreground">Companies Analyzed</p>
                          </div>
                        </div>
                      )}
                      <div className="pt-4 border-t">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleClearMemory}
                          disabled={loading}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear Memory Cache
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          This will clear all cached job and company data
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No memory stats available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  Security Settings
                </CardTitle>
                <CardDescription>Authentication and security configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Authentication Status</h4>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Authenticated</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        You are logged in with valid credentials
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Session Management</h4>
                    <Button variant="outline" className="w-full" onClick={() => {
                      localStorage.removeItem('token')
                      router.push('/login')
                    }}>
                      <Key className="w-4 h-4 mr-2" />
                      Logout & Clear Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  Database Management
                </CardTitle>
                <CardDescription>Database operations and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Database Connection
                      </Button>
                      <Button variant="outline" className="w-full justify-start" disabled>
                        <Database className="w-4 h-4 mr-2" />
                        Optimize Database (Coming Soon)
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Data Management</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" disabled>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clean Old Records (Coming Soon)
                      </Button>
                      <Button variant="outline" className="w-full justify-start" disabled>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Backup Database (Coming Soon)
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="apis" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-orange-500" />
                  API Configuration
                </CardTitle>
                <CardDescription>External API keys and service configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">API Status Overview</h4>
                  {backendHealth?.api_status && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(backendHealth.api_status).map(([api, status]) => (
                        <div key={api} className={`p-4 rounded-lg border ${
                          status 
                            ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{api}</span>
                            {status ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <p className={`text-xs ${
                            status 
                              ? 'text-green-700 dark:text-green-300' 
                              : 'text-red-700 dark:text-red-300'
                          }`}>
                            {status ? 'Connected and operational' : 'Not configured or offline'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-900 dark:text-blue-100">API Key Management</h5>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          API keys are managed through environment variables on the backend. 
                          Contact your system administrator to update API configurations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
