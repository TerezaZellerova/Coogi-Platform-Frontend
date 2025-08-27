'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'

export default function APITestPage() {
  const [backendStatus, setBackendStatus] = useState<any>(null)
  const [authUsers, setAuthUsers] = useState<any>(null)
  const [leadLists, setLeadLists] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

  const testBackendConnection = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test backend health
      const healthResponse = await fetch(`${API_BASE}/`)
      const healthData = await healthResponse.json()
      setBackendStatus(healthData)

      // Test auth users endpoint
      const usersResponse = await fetch(`${API_BASE}/api/auth/users`)
      const usersData = await usersResponse.json()
      setAuthUsers(usersData)

      // Test lead lists endpoint
      const leadListsResponse = await fetch(`${API_BASE}/lead-lists`)
      const leadListsData = await leadListsResponse.json()
      setLeadLists(leadListsData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testBackendConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">API Connection Test</h1>
            <p className="text-slate-600 dark:text-slate-400">Testing connection between frontend and backend</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">API Base URL: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{API_BASE}</code></p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Backend Health Status */}
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Backend Health</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !backendStatus ? (
                <div className="text-slate-500">Loading...</div>
              ) : backendStatus ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Status: {backendStatus.status}
                  </div>
                  <div className="text-xs text-slate-600">
                    Demo Mode: {backendStatus.demo_mode ? 'Yes' : 'No'}
                  </div>
                  {backendStatus.api_status && (
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="font-medium">API Status:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(backendStatus.api_status).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs">{key}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">Disconnected</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auth Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-800">Auth Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !authUsers ? (
                <div className="text-slate-500">Loading...</div>
              ) : authUsers ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">
                      {authUsers.test_users?.length || 0} users
                    </span>
                  </div>
                  {authUsers.test_users?.map((user: any, index: number) => (
                    <div key={index} className="text-xs text-slate-600">
                      {user.name} ({user.email}) - {user.role}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">Failed to load</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead Lists */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-800">Lead Lists</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !leadLists ? (
                <div className="text-slate-500">Loading...</div>
              ) : leadLists ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">
                      {leadLists.count || 0} lead lists
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Status: {leadLists.status}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">Failed to load</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="mt-6 border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <Button 
            onClick={testBackendConnection} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Testing...' : 'Retest Connection'}
          </Button>
        </div>
      </div>
    </div>
  )
}
