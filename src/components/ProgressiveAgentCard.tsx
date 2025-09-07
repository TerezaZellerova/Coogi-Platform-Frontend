// Progressive Agent Creation Component with real-time updates and error handling
'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Briefcase, 
  Users, 
  Mail, 
  Target,
  RefreshCw,
  Eye,
  Download,
  X,
  Zap,
  Timer,
  TrendingUp
} from 'lucide-react'
import { ProgressiveAgent, ProgressiveAgentResponse, apiClient } from '@/lib/api-production'
import { ProgressiveAgentResults } from './ProgressiveAgentResults'

interface ProgressiveAgentCardProps {
  agent: ProgressiveAgent
  onUpdate?: (agent: ProgressiveAgent) => void
  onRemove?: (agentId: string) => void
}

export function ProgressiveAgentCard({ agent, onUpdate, onRemove }: ProgressiveAgentCardProps) {
  const [isPolling, setIsPolling] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'polling' | 'error'>('connecting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null)
  const [expandedDetails, setExpandedDetails] = useState(false)

  // Setup real-time updates on mount
  useEffect(() => {
    if (agent.status === 'completed' || agent.status === 'failed') {
      setIsPolling(false)
      setConnectionStatus('connected')
      
      // Force a final update for completed agents to ensure we have the latest data
      if (agent.status === 'completed') {
        const fetchFinalUpdate = async () => {
          try {
            const response = await apiClient.getProgressiveAgent(agent.id)
            if (response.agent && onUpdate) {
              onUpdate(response.agent)
            }
          } catch (error) {
            console.warn('Failed to fetch final agent update:', error)
          }
        }
        fetchFinalUpdate()
      }
      return
    }

    setConnectionStatus('connecting')
    
    // Try WebSocket first, fallback to polling
    let ws: WebSocket | null = null
    
    try {
      ws = apiClient.connectProgressiveUpdates(
        agent.id,
        (updatedAgent: ProgressiveAgent) => {
          onUpdate?.(updatedAgent)
          setConnectionStatus('connected')
          setErrorMessage(null)
          setRetryCount(0)
        },
        (completedAgent: ProgressiveAgent) => {
          onUpdate?.(completedAgent)
          setIsPolling(false)
          setConnectionStatus('connected')
          if (ws && typeof ws.close === 'function') {
            ws.close()
            setWsConnection(null)
          }
        },
        (error: string) => {
          setErrorMessage(error)
          setConnectionStatus('error')
        }
      )
    } catch (error) {
      console.warn('Error setting up agent updates:', error)
      setConnectionStatus('error')
      setErrorMessage('Failed to connect to agent updates')
    }

    if (ws && typeof ws.close === 'function') {
      setWsConnection(ws)
      setConnectionStatus('connected')
    } else {
      setConnectionStatus('polling')
    }

    // Cleanup on unmount
    return () => {
      if (ws && typeof ws.close === 'function') {
        try {
          ws.close()
        } catch (error) {
          console.warn('Error closing WebSocket:', error)
        }
        setWsConnection(null)
      }
      setIsPolling(false)
    }
  }, [agent.id, agent.status])

  const handleRetry = useCallback(async () => {
    setErrorMessage(null)
    setRetryCount(prev => prev + 1)
    setConnectionStatus('connecting')
    
    try {
      const response = await apiClient.getProgressiveAgent(agent.id)
      onUpdate?.(response.agent)
      setConnectionStatus('connected')
    } catch (error) {
      setErrorMessage('Failed to retry connection')
      setConnectionStatus('error')
    }
  }, [agent.id, onUpdate])

  const handleRemove = useCallback(() => {
    if (wsConnection) {
      wsConnection.close()
    }
    onRemove?.(agent.id)
  }, [agent.id, wsConnection, onRemove])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
      case 'running':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Connecting
          </Badge>
        )
      case 'connected':
        return wsConnection ? (
          <Badge variant="default" className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        ) : (
          <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600">
            <RefreshCw className="h-3 w-3 mr-1" />
            Polling
          </Badge>
        )
      case 'polling':
        return (
          <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600">
            <RefreshCw className="h-3 w-3 mr-1" />
            Polling
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive" className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
    }
  }

  const getOverallStatusBadge = () => {
    switch (agent.status) {
      case 'initializing':
        return (
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Initializing
          </Badge>
        )
      case 'linkedin_stage':
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700">
            <Briefcase className="h-3 w-3 mr-1" />
            LinkedIn Stage
          </Badge>
        )
      case 'enrichment_stage':
        return (
          <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700">
            <TrendingUp className="h-3 w-3 mr-1" />
            Enriching
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive" className="dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="dark:border-gray-700 dark:text-gray-300">
            <Clock className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  // Dynamic stages based on agent target type
  const getStagesForAgent = (targetType: string) => {
    if (targetType === 'job_candidates') {
      return [
        { key: 'candidate_search', icon: <Users className="h-4 w-4" />, label: 'Professional Search', priority: 1 },
        { key: 'contact_enrichment', icon: <Mail className="h-4 w-4" />, label: 'Contact Enrichment', priority: 2 },
        { key: 'profile_analysis', icon: <Target className="h-4 w-4" />, label: 'Profile Analysis', priority: 3 },
        { key: 'campaign_creation', icon: <Briefcase className="h-4 w-4" />, label: 'Campaign Creation', priority: 4 }
      ]
    } else {
      // hiring_managers workflow (default)
      return [
        { key: 'linkedin_fetch', icon: <Briefcase className="h-4 w-4" />, label: 'LinkedIn Jobs', priority: 1 },
        { key: 'other_boards', icon: <Target className="h-4 w-4" />, label: 'Other Job Boards', priority: 2 },
        { key: 'contact_enrichment', icon: <Users className="h-4 w-4" />, label: 'Contact Discovery', priority: 3 },
        { key: 'campaign_creation', icon: <Mail className="h-4 w-4" />, label: 'Campaign Creation', priority: 4 }
      ]
    }
  }

  const stages = getStagesForAgent(agent.target_type || 'hiring_managers')

  const getElapsedTime = () => {
    const now = new Date()
    const created = new Date(agent.created_at)
    const diff = now.getTime() - created.getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const getETAForNextStage = () => {
    if (agent.status === 'completed' || agent.status === 'failed') return null
    
    // Estimate based on current stage
    if (agent.status === 'linkedin_stage') return '~2 minutes'
    if (agent.status === 'enrichment_stage') return '~5 minutes'
    return '~1 minute'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">
              {agent.query}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              {getOverallStatusBadge()}
              {getConnectionStatusBadge()}
              {agent.status !== 'completed' && agent.status !== 'failed' && (
                <Badge variant="outline" className="text-gray-600">
                  <Timer className="h-3 w-3 mr-1" />
                  {getElapsedTime()}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(agent.status === 'completed' || agent.staged_results.linkedin_jobs.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedDetails(!expandedDetails)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {connectionStatus === 'error' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="text-orange-600 border-orange-300"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Connection Error</span>
              {retryCount > 0 && (
                <span className="text-xs text-red-600 dark:text-red-400">(Retry #{retryCount})</span>
              )}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errorMessage}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="mt-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Retry Connection
            </Button>
          </div>
        )}

        {/* ETA for next stage */}
        {agent.status !== 'completed' && agent.status !== 'failed' && getETAForNextStage() && (
          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Next update in {getETAForNextStage()}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{agent.total_progress}%</span>
          </div>
          <Progress value={agent.total_progress} className="h-2" />
        </div>

        {/* Stage Progress */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Stages</h4>
          <div className="grid grid-cols-1 gap-3">
            {stages.map(({ key, icon, label }) => {
              const stage = agent.stages[key]
              if (!stage) return null

              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={getStatusColor(stage.status)}>
                        {getStatusIcon(stage.status)}
                        <span className="ml-1">{stage.status}</span>
                      </Badge>
                      {stage.results_count > 0 && (
                        <span className="text-xs text-gray-600">
                          {stage.results_count} results
                        </span>
                      )}
                    </div>
                    {stage.status === 'running' && (
                      <Progress value={stage.progress} className="h-1" />
                    )}
                    {stage.error_message && (
                      <p className="text-xs text-red-600 mt-1">{stage.error_message}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agent.target_type === 'job_candidates' ? (
            // Job Candidates Results
            <>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {agent.staged_results.total_contacts || (agent.staged_results.verified_contacts || []).length}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Candidates</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {(agent.staged_results.verified_contacts || []).filter((contact: any) => contact.email).length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">With Email</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {(agent.staged_results.verified_contacts || []).filter((contact: any) => contact.verified).length}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Verified</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                  {agent.staged_results.total_campaigns}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Campaigns</div>
              </div>
            </>
          ) : (
            // Hiring Managers Results
            <>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {agent.staged_results.total_jobs}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Total Jobs</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {(() => {
                    // Count LinkedIn jobs from both linkedin_jobs array and other_jobs array, exclude demo data
                    const directLinkedInJobs = (agent.staged_results.linkedin_jobs || []).filter(job => !job.is_demo).length;
                    const linkedInJobsInOtherArray = (agent.staged_results.other_jobs || []).filter(job => 
                      (!job.is_demo) && (job.site?.toLowerCase().includes('linkedin') || 
                      job.url?.toLowerCase().includes('linkedin.com'))
                    ).length;
                    return directLinkedInJobs + linkedInJobsInOtherArray;
                  })()}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">LinkedIn Jobs</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {agent.staged_results.total_contacts}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Contacts</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                  {agent.staged_results.total_campaigns}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Campaigns</div>
              </div>
            </>
          )}
        </div>

        {/* Results Preview */}
        {agent.target_type === 'job_candidates' ? (
          // Candidates Preview
          (() => {
            const candidates = (agent.staged_results.verified_contacts || []).filter((contact: any) => !contact.is_demo);
            
            return candidates.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Candidates Preview</h4>
                  <span className="text-xs text-gray-500">{candidates.length} found</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {candidates.slice(0, 3).map((candidate: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Candidate'}
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {candidate.title || 'Professional'} {candidate.company && `at ${candidate.company}`}
                          </p>
                          {candidate.email && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{candidate.email}</p>
                          )}
                        </div>
                        {candidate.verified && (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {candidates.length > 3 && (
                  <div className="text-center">
                    <ProgressiveAgentResults agent={agent} trigger={
                      <Button variant="outline" size="sm" className="text-xs">
                        View all {candidates.length} candidates →
                      </Button>
                    } />
                  </div>
                )}
              </div>
            ) : null;
          })()
        ) : (
          // LinkedIn Jobs Preview (Original)
          (() => {
            // Get LinkedIn jobs from both arrays and filter out demo data
            const directLinkedInJobs = (agent.staged_results.linkedin_jobs || []).filter(job => !job.is_demo);
            const linkedInJobsInOther = (agent.staged_results.other_jobs || []).filter(job => 
              (!job.is_demo) && (job.site?.toLowerCase().includes('linkedin') || 
              job.url?.toLowerCase().includes('linkedin.com'))
            );
            const allLinkedInJobs = [...directLinkedInJobs, ...linkedInJobsInOther];
            
            return allLinkedInJobs.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">LinkedIn Jobs Preview</h4>
                <Badge variant="outline" className="text-xs">
                  {allLinkedInJobs.length} found
                </Badge>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {allLinkedInJobs.slice(0, 3).map((job, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                    <div className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 dark:text-gray-200">{job.title}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">{job.company} • {job.location}</div>
                    {job.salary && (
                      <div className="text-green-600 dark:text-green-400 text-xs font-medium mt-1">
                        💰 {typeof job.salary === 'string' ? job.salary : 'Salary available'}
                      </div>
                    )}
                    {job.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(job.url, '_blank')
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Job
                      </Button>
                    )}
                  </div>
                ))}
                {allLinkedInJobs.length > 3 && (
                  <ProgressiveAgentResults 
                    agent={agent}
                    trigger={
                      <div className="text-xs text-blue-600 dark:text-blue-400 text-center p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded cursor-pointer">
                        View all {allLinkedInJobs.length} LinkedIn jobs →
                      </div>
                    }
                  />
                )}
              </div>
            </div>
            ) : null;
          })()
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <ProgressiveAgentResults 
            agent={agent} 
            trigger={
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                View Results ({agent.staged_results.total_jobs} jobs)
              </Button>
            } 
          />
          
          {(() => {
            // Get LinkedIn jobs from both arrays for copy button, excluding demo data
            const directLinkedInJobs = (agent.staged_results.linkedin_jobs || []).filter(job => !job.is_demo);
            const linkedInJobsInOther = (agent.staged_results.other_jobs || []).filter(job => 
              (!job.is_demo) && (job.site?.toLowerCase().includes('linkedin') || 
              job.url?.toLowerCase().includes('linkedin.com'))
            );
            const allLinkedInJobs = [...directLinkedInJobs, ...linkedInJobsInOther];
            
            return allLinkedInJobs.length > 0 ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const jobsText = allLinkedInJobs
                    .map(job => `${job.title} at ${job.company} - ${job.location}\n${job.url || ''}`)
                    .join('\n\n')
                  navigator.clipboard.writeText(jobsText)
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Copy LinkedIn Jobs
              </Button>
            ) : null;
          })()}
        </div>

        {/* Final Stats */}
        {agent.final_stats && (
          <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Final Results</h4>
            <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
              <div>Completed: {formatTimestamp(agent.final_stats.completion_time)}</div>
              <div>Total Processing Time: {Math.round((new Date(agent.final_stats.completion_time).getTime() - new Date(agent.created_at).getTime()) / 1000 / 60)} minutes</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
