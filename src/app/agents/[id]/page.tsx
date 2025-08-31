'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Activity,
  Clock,
  Database,
  Mail,
  Building2,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { apiClient, type Agent, type AgentLog, type AgentStatus } from '@/lib/api-production'
import { useAgentMonitoring } from '@/hooks/useAgentMonitoring'
import { useToast } from '@/components/ui/toast'

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const agentId = params.id as string
  
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const {
    logs,
    statuses,
    addAgent,
    removeAgent,
    startAgentMonitoring,
    stopAgentMonitoring
  } = useAgentMonitoring({
    enabled: true,
    interval: 3000, // Faster updates for detail page
    onStatusChange: (agent, status) => {
      setAgent(prev => prev ? { ...prev, status: status.status } : null)
    }
  })

  const agentLogs = logs.get(agentId) || []
  const agentStatus = statuses.get(agentId)

  useEffect(() => {
    loadAgentDetails()
  }, [agentId])

  const loadAgentDetails = async () => {
    try {
      setLoading(true)
      
      // In a real app, you'd fetch agent details from an API
      // For now, we'll create a mock agent based on the ID
      const mockAgent: Agent = {
        id: agentId,
        batch_id: agentId,
        query: `Agent ${agentId}`, // This would come from API
        status: 'running',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_jobs_found: 0,
        total_emails_found: 0,
        hours_old: 24
      }
      
      setAgent(mockAgent)
      addAgent(mockAgent)
      
    } catch (error) {
      console.error('Error loading agent details:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load agent details'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!agent) return

    try {
      setActionLoading(true)
      
      let response
      switch (action) {
        case 'pause':
          response = await apiClient.pauseAgent(agent.batch_id || agent.id)
          break
        case 'resume':
          response = await apiClient.resumeAgent(agent.batch_id || agent.id)
          break
        case 'cancel':
          response = await apiClient.cancelAgent(agent.batch_id || agent.id)
          break
      }

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Success',
          message: response.message
        })
        
        if (action === 'cancel') {
          // Navigate back after cancellation
          setTimeout(() => router.push('/agents'), 2000)
        }
      } else {
        throw new Error(response.message)
      }
      
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: `Failed to ${action} agent: ${error}`
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'processing':
        return <Activity className="w-4 h-4 text-green-500 animate-pulse" />
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />
      default:
        return <AlertCircle className="w-3 h-3 text-blue-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading agent details...</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-foreground">Agent not found</p>
          <Button onClick={() => router.push('/agents')} className="mt-4">
            Back to Agents
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/agents')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Agents
              </Button>
              
              <div className="h-6 w-px bg-border" />
              
              <div className="flex items-center space-x-3">
                {getStatusIcon(agent.status)}
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Agent: {agent.query}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    ID: {agent.id} • Created: {new Date(agent.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {agent.status === 'running' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('pause')}
                  disabled={actionLoading}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              
              {agent.status === 'paused' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('resume')}
                  disabled={actionLoading}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction('cancel')}
                disabled={actionLoading || agent.status === 'completed'}
              >
                <Square className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Status and Metrics */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(agent.status)}
                  Agent Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={
                    agent.status === 'running' ? 'default' :
                    agent.status === 'completed' ? 'secondary' :
                    agent.status === 'failed' ? 'destructive' : 'outline'
                  }>
                    {agent.status}
                  </Badge>
                </div>
                
                {agentStatus && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">
                        {agentStatus.progress || 0}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${agentStatus.progress || 0}%` }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Metrics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {agentStatus?.jobs_found || agent.total_jobs_found}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Jobs Found
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {agentStatus?.emails_found || agent.total_emails_found}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Mail className="w-3 h-3" />
                      Emails Found
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {agentStatus?.processed_cities || 0}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Cities
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {agentStatus?.processed_companies || 0}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Database className="w-3 h-3" />
                      Companies
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timing Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Started</span>
                  <span className="font-medium">
                    {agentStatus?.start_time ? 
                      new Date(agentStatus.start_time).toLocaleString() :
                      new Date(agent.created_at).toLocaleString()
                    }
                  </span>
                </div>
                
                {agentStatus?.end_time && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Ended</span>
                    <span className="font-medium">
                      {new Date(agentStatus.end_time).toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {agentStatus?.end_time ? 
                      `${Math.round((new Date(agentStatus.end_time).getTime() - new Date(agentStatus.start_time || agent.created_at).getTime()) / 60000)} min` :
                      `${Math.round((Date.now() - new Date(agent.created_at).getTime()) / 60000)} min`
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Logs */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Live Logs
                  <Badge variant="outline" className="ml-auto">
                    {agentLogs.length} entries
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Real-time activity feed for this agent
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-full px-6 pb-6">
                  <div className="space-y-2">
                    {agentLogs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No logs yet. Agent activity will appear here.</p>
                      </div>
                    ) : (
                      agentLogs.slice().reverse().map((log, index) => (
                        <div 
                          key={`${log.id}-${index}`}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getLogIcon(log.level)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-muted-foreground font-mono">
                                {formatTimestamp(log.timestamp)}
                              </span>
                              {log.company && (
                                <Badge variant="outline" className="text-xs">
                                  {log.company}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">
                              {log.message}
                            </p>
                            {log.email && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Email: {log.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
