'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { apiClient, type Agent, type DashboardStats } from '@/lib/api-production'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Briefcase, 
  Mail,
  Calendar,
  BarChart3,
  PieChart,
  ArrowLeft,
  RefreshCw,
  Download
} from 'lucide-react'

export default function AnalyticsEnhanced() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    activeAgents: 0,
    totalRuns: 0,
    totalJobs: 0,
    successRate: 0
  })
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadAnalyticsData()
  }, [router])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const [statsData, agentsData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getAgents()
      ])
      setStats(statsData)
      setAgents(agentsData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceMetrics = () => {
    const totalJobsFound = agents.reduce((sum, agent) => sum + (agent.total_jobs_found || 0), 0)
    const totalEmailsFound = agents.reduce((sum, agent) => sum + (agent.total_emails_found || 0), 0)
    const conversionRate = totalJobsFound > 0 ? (totalEmailsFound / totalJobsFound) * 100 : 0
    
    return {
      totalJobsFound,
      totalEmailsFound,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgJobsPerAgent: agents.length > 0 ? Math.round(totalJobsFound / agents.length) : 0,
      avgEmailsPerAgent: agents.length > 0 ? Math.round(totalEmailsFound / agents.length) : 0
    }
  }

  const metrics = getPerformanceMetrics()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Analytics & Insights
                  </h1>
                  <p className="text-xs text-muted-foreground">Detailed performance metrics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={loadAnalyticsData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.activeAgents}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Currently running</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalRuns}</div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Completed searches</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Jobs Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{metrics.totalJobsFound.toLocaleString()}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Opportunities discovered</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Emails Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{metrics.totalEmailsFound.toLocaleString()}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Verified contacts</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-pink-700 dark:text-pink-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-900 dark:text-pink-100">{stats.successRate}%</div>
              <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">Email verification</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                Conversion Metrics
              </CardTitle>
              <CardDescription>Lead conversion and efficiency analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.conversionRate}%</div>
                  <p className="text-sm text-muted-foreground">Job-to-Email Rate</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.avgJobsPerAgent}</div>
                  <p className="text-sm text-muted-foreground">Avg Jobs/Agent</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Jobs Discovery Rate</span>
                  <span className="text-sm font-medium">High</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email Verification Rate</span>
                  <span className="text-sm font-medium">{stats.successRate}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: `${stats.successRate}%`}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Agent Performance
              </CardTitle>
              <CardDescription>Individual agent statistics and rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No agents to analyze</p>
                ) : (
                  agents.slice(0, 5).map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{agent.query}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.total_jobs_found || 0} jobs • {agent.total_emails_found || 0} emails
                          </p>
                        </div>
                      </div>
                      <Badge variant={agent.status === 'running' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Tabs */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Trends & Patterns
            </TabsTrigger>
            <TabsTrigger value="efficiency" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Efficiency Analysis
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Key Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Search Trends</CardTitle>
                <CardDescription>Popular search queries and timing patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Most Active Search Terms</h4>
                      <div className="space-y-2">
                        {Array.from(new Set(agents.map(a => a.query))).slice(0, 5).map((query, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-sm">{query}</span>
                            <span className="text-sm font-medium">{agents.filter(a => a.query === query).length}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Agent Status Distribution</h4>
                      <div className="space-y-2">
                        {['running', 'completed', 'paused', 'failed'].map(status => {
                          const count = agents.filter(a => a.status === status).length
                          return (
                            <div key={status} className="flex justify-between">
                              <span className="text-sm capitalize">{status}</span>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
                <CardDescription>Performance benchmarks and optimization opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">{metrics.avgEmailsPerAgent}</div>
                    <p className="text-sm text-green-700 dark:text-green-300">Avg Emails per Agent</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalRuns}</div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Total Search Runs</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{metrics.avgJobsPerAgent}</div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Avg Jobs per Agent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Key Insights & Recommendations</CardTitle>
                <CardDescription>AI-powered insights to optimize your lead generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🎯 Performance Insight</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your agents have a {stats.successRate}% email verification success rate. This is {stats.successRate > 70 ? 'excellent' : stats.successRate > 50 ? 'good' : 'below average'} compared to industry standards.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">💡 Optimization Tip</h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {agents.length > 0 ? `Consider focusing on your top performing query: "${agents.sort((a, b) => (b.total_emails_found || 0) - (a.total_emails_found || 0))[0]?.query}" which has generated the most verified emails.` : 'Create more agents to start generating insights.'}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">📊 Data Quality</h4>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Your job-to-email conversion rate is {metrics.conversionRate}%. {metrics.conversionRate > 15 ? 'Excellent data quality!' : 'Consider refining search criteria for better conversion rates.'}
                    </p>
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
