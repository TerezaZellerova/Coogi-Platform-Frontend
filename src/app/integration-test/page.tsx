'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient as api } from '@/lib/api-production'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  duration?: number
}

export default function IntegrationTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Health Check', status: 'pending', message: 'Not started' },
    { name: 'Authentication Test', status: 'pending', message: 'Not started' },
    { name: 'Dashboard Stats', status: 'pending', message: 'Not started' },
    { name: 'Get Agents', status: 'pending', message: 'Not started' },
    { name: 'Get Campaigns', status: 'pending', message: 'Not started' },
    { name: 'Get Leads', status: 'pending', message: 'Not started' },
    { name: 'Environment Variables', status: 'pending', message: 'Not started' },
  ])

  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ))
  }

  const testBackendHealth = async (index: number) => {
    const start = Date.now()
    try {
      updateTest(index, { status: 'pending', message: 'Testing backend connection...' })
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/`)
      const data = await response.json()
      
      if (data.status === 'healthy') {
        updateTest(index, { 
          status: 'success', 
          message: `Backend healthy - API Status: ${Object.keys(data.api_status).filter(k => data.api_status[k]).join(', ')}`,
          duration: Date.now() - start
        })
      } else {
        updateTest(index, { 
          status: 'error', 
          message: 'Backend unhealthy',
          duration: Date.now() - start
        })
      }
    } catch (error) {
      updateTest(index, { 
        status: 'error', 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start
      })
    }
  }

  const testAuthentication = async (index: number) => {
    const start = Date.now()
    try {
      updateTest(index, { status: 'pending', message: 'Testing authentication...' })
      
      const result = await api.login('test@coogi.dev', 'coogi123')
      
      if (result.token && result.user) {
        updateTest(index, { 
          status: 'success', 
          message: `Login successful - User: ${result.user.email}`,
          duration: Date.now() - start
        })
      } else {
        updateTest(index, { 
          status: 'error', 
          message: 'Login failed - no token received',
          duration: Date.now() - start
        })
      }
    } catch (error) {
      updateTest(index, { 
        status: 'error', 
        message: `Auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start
      })
    }
  }

  const testDashboardStats = async (index: number) => {
    const start = Date.now()
    try {
      updateTest(index, { status: 'pending', message: 'Fetching dashboard stats...' })
      
      const stats = await api.getDashboardStats()
      
      updateTest(index, { 
        status: 'success', 
        message: `Stats: ${stats.activeAgents} agents, ${stats.totalJobs} jobs, ${stats.successRate}% success`,
        duration: Date.now() - start
      })
    } catch (error) {
      updateTest(index, { 
        status: 'error', 
        message: `Stats failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start
      })
    }
  }

  const testGetAgents = async (index: number) => {
    const start = Date.now()
    try {
      updateTest(index, { status: 'pending', message: 'Fetching agents...' })
      
      const agents = await api.getAgents()
      
      updateTest(index, { 
        status: 'success', 
        message: `Found ${agents.length} agents`,
        duration: Date.now() - start
      })
    } catch (error) {
      updateTest(index, { 
        status: 'error', 
        message: `Agents failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start
      })
    }
  }

  const testGetCampaigns = async (index: number) => {
    const start = Date.now()
    try {
      updateTest(index, { status: 'pending', message: 'Fetching campaigns...' })
      
      const campaigns = await api.getCampaigns()
      
      updateTest(index, { 
        status: 'success', 
        message: `Found ${campaigns.length} campaigns`,
        duration: Date.now() - start
      })
    } catch (error) {
      updateTest(index, { 
        status: 'error', 
        message: `Campaigns failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start
      })
    }
  }

  const testGetLeads = async (index: number) => {
    const start = Date.now()
    try {
      updateTest(index, { status: 'pending', message: 'Fetching leads...' })
      
      const leads = await api.getLeads()
      
      updateTest(index, { 
        status: 'success', 
        message: `Found ${leads.length} leads`,
        duration: Date.now() - start
      })
    } catch (error) {
      updateTest(index, { 
        status: 'error', 
        message: `Leads failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start
      })
    }
  }

  const testEnvironmentVariables = async (index: number) => {
    const start = Date.now()
    try {
      updateTest(index, { status: 'pending', message: 'Checking environment variables...' })
      
      const envVars = {
        API_BASE: process.env.NEXT_PUBLIC_API_BASE,
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : 'MISSING',
        OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? '***SET***' : 'MISSING',
        HUNTER_API_KEY: process.env.NEXT_PUBLIC_HUNTER_API_KEY ? '***SET***' : 'MISSING',
      }
      
      const missingVars = Object.entries(envVars).filter(([_, value]) => !value || value === 'MISSING')
      
      if (missingVars.length === 0) {
        updateTest(index, { 
          status: 'success', 
          message: 'All environment variables are set',
          duration: Date.now() - start
        })
      } else {
        updateTest(index, { 
          status: 'error', 
          message: `Missing vars: ${missingVars.map(([key]) => key).join(', ')}`,
          duration: Date.now() - start
        })
      }
    } catch (error) {
      updateTest(index, { 
        status: 'error', 
        message: `Env check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start
      })
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', message: 'Waiting...', duration: undefined })))
    
    // Run tests sequentially to avoid overwhelming the backend
    await testBackendHealth(0)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testAuthentication(1)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testDashboardStats(2)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testGetAgents(3)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testGetCampaigns(4)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testGetLeads(5)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testEnvironmentVariables(6)
    
    setIsRunning(false)
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 text-white">✅ Success</Badge>
      case 'error':
        return <Badge className="bg-red-500 text-white">❌ Error</Badge>
      case 'pending':
      default:
        return <Badge className="bg-yellow-500 text-white">⏳ Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Backend Integration Test</h1>
          <p className="text-muted-foreground mb-6">
            Comprehensive test of all backend API endpoints and environment configuration
          </p>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="mb-8"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>

        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  {getStatusBadge(test.status)}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {test.message}
                  {test.duration && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({test.duration}ms)
                    </span>
                  )}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>API_BASE:</strong> {process.env.NEXT_PUBLIC_API_BASE || 'NOT SET'}
              </div>
              <div>
                <strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
              </div>
              <div>
                <strong>SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : 'NOT SET'}
              </div>
              <div>
                <strong>OPENAI_API_KEY:</strong> {process.env.NEXT_PUBLIC_OPENAI_API_KEY ? '***SET***' : 'NOT SET'}
              </div>
              <div>
                <strong>HUNTER_API_KEY:</strong> {process.env.NEXT_PUBLIC_HUNTER_API_KEY ? '***SET***' : 'NOT SET'}
              </div>
              <div>
                <strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'NOT SET'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
