'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  CheckCircle, 
  Loader2, 
  Search, 
  Users, 
  Mail, 
  Database, 
  Rocket,
  Play,
  ArrowRight,
  Clock,
  Briefcase,
  ExternalLink
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { apiClient, type ProgressiveAgent } from '@/lib/api-production'

interface AgentLaunchModalProps {
  isOpen: boolean
  onCloseAction: () => void
  onAgentCreatedAction: (agent: ProgressiveAgent) => void
  onErrorAction: (error: string) => void
}

interface ProgressStage {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'running' | 'completed' | 'failed'
  resultsCount?: number
  errorMessage?: string
}

export default function AgentLaunchModal({ 
  isOpen, 
  onCloseAction, 
  onAgentCreatedAction, 
  onErrorAction 
}: AgentLaunchModalProps) {
  const [formData, setFormData] = useState({
    query: '',
    hoursOld: '24',
    customTags: ''
  })
  
  const [isCreating, setIsCreating] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<ProgressiveAgent | null>(null)
  const [overallProgress, setOverallProgress] = useState(0)
  
  // Real-time results state
  const [liveResults, setLiveResults] = useState<{
    jobs: any[]
    contacts: any[]
    campaigns: any[]
  }>({
    jobs: [],
    contacts: [],
    campaigns: []
  })
  
  const [stages, setStages] = useState<ProgressStage[]>([
    {
      id: 'linkedin_fetch',
      label: 'LinkedIn Job Search',
      description: 'Finding latest job opportunities on LinkedIn',
      icon: <Search className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'other_boards',
      label: 'Other Job Boards',
      description: 'Expanding search to Indeed, Glassdoor, and more',
      icon: <Database className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'contact_enrichment',
      label: 'Contact Discovery',
      description: 'Finding hiring managers and decision makers',
      icon: <Users className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'campaign_creation',
      label: 'Campaign Setup',
      description: 'Creating personalized outreach campaigns',
      icon: <Mail className="w-4 h-4" />,
      status: 'pending'
    }
  ])

  // Reset modal state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setIsCreating(false)
      setCurrentAgent(null)
      setOverallProgress(0)
      setLiveResults({ jobs: [], contacts: [], campaigns: [] })
      setStages(prev => prev.map(stage => ({ 
        ...stage, 
        status: 'pending', 
        resultsCount: undefined, 
        errorMessage: undefined 
      })))
    }
  }, [isOpen])

  // Polling for agent updates
  useEffect(() => {
    if (!currentAgent || !isCreating) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await apiClient.getProgressiveAgent(currentAgent.id)
        const updatedAgent = response.agent
        
        setCurrentAgent(updatedAgent)
        
        // Update stages based on agent status
        const newStages = stages.map(stage => {
          const agentStage = updatedAgent.stages[stage.id]
          if (agentStage) {
            return {
              ...stage,
              status: agentStage.status as any,
              resultsCount: agentStage.results_count,
              errorMessage: agentStage.error_message
            }
          }
          return stage
        })
        
        setStages(newStages)
        
        // Update live results from agent's staged_results
        if (updatedAgent.staged_results) {
          setLiveResults({
            jobs: updatedAgent.staged_results.linkedin_jobs || [],
            contacts: updatedAgent.staged_results.verified_contacts || [],
            campaigns: updatedAgent.staged_results.campaigns || []
          })
        }
        
        // Calculate overall progress
        const completedStages = newStages.filter(s => s.status === 'completed').length
        const runningStages = newStages.filter(s => s.status === 'running').length
        const totalStages = newStages.length
        
        let progress = (completedStages / totalStages) * 100
        if (runningStages > 0) {
          progress += (runningStages / totalStages) * 25 // Add partial progress for running stages
        }
        
        setOverallProgress(Math.min(progress, 100))
        
        // Check if agent is complete
        if (updatedAgent.status === 'completed') {
          setIsCreating(false)
          setOverallProgress(100)
          onAgentCreatedAction(updatedAgent)
          
          // Auto-close after showing completion for 2 seconds
          setTimeout(() => {
            onCloseAction()
          }, 2000)
        } else if (updatedAgent.status === 'failed') {
          setIsCreating(false)
          onErrorAction('Agent creation failed')
        }
        
      } catch (error) {
        console.error('Error polling agent status:', error)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [currentAgent, isCreating])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.query.trim()) return

    setIsCreating(true)
    
    try {
      // Update first stage to running
      setStages(prev => prev.map(stage => 
        stage.id === 'linkedin_fetch' 
          ? { ...stage, status: 'running' }
          : stage
      ))
      
      const response = await apiClient.createProgressiveAgent(
        formData.query.trim(),
        parseInt(formData.hoursOld),
        formData.customTags.trim() || undefined
      )
      
      setCurrentAgent(response.agent)
      
    } catch (error) {
      console.error('Error creating agent:', error)
      setIsCreating(false)
      onErrorAction(error instanceof Error ? error.message : 'Failed to create agent')
    }
  }

  const getStageIcon = (stage: ProgressStage) => {
    if (stage.status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else if (stage.status === 'running') {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    } else if (stage.status === 'failed') {
      return <CheckCircle className="w-4 h-4 text-red-500" />
    } else {
      return stage.icon
    }
  }

  const getStageStatus = (stage: ProgressStage) => {
    if (stage.status === 'completed') {
      return (
        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" />
          {stage.resultsCount ? `${stage.resultsCount} found` : 'Complete'}
        </div>
      )
    } else if (stage.status === 'running') {
      return (
        <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Processing...
        </div>
      )
    } else if (stage.status === 'failed') {
      return (
        <div className="text-sm text-red-600 dark:text-red-400">
          Failed
        </div>
      )
    } else {
      return (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 mr-1" />
          Waiting
        </div>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            {isCreating ? 'Launching Your Agent' : 'Create New Agent'}
          </DialogTitle>
          <DialogDescription>
            {isCreating 
              ? 'Your agent is running through multiple stages to find the best opportunities and contacts.'
              : 'Set up a new lead generation agent with custom parameters to find relevant job opportunities.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-2 pl-1">
          {!isCreating ? (
          // Form phase
          <form onSubmit={handleSubmit} className="space-y-6 p-1">
            <div className="space-y-3">
              <label htmlFor="query" className="text-sm font-semibold">
                Search Query *
              </label>
              <Input
                id="query"
                placeholder="e.g., software engineer, nurse, marketing manager"
                value={formData.query}
                onChange={(e) => setFormData(prev => ({ ...prev, query: e.target.value }))}
                required
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Describe the type of job or role you're looking for
              </p>
            </div>
            
            <div className="space-y-3">
              <label htmlFor="hoursOld" className="text-sm font-semibold">
                Job Timeframe
              </label>
              <select
                id="hoursOld"
                value={formData.hoursOld}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursOld: e.target.value }))}
                className="w-full h-11 px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 focus:shadow-[0_0_0_1px_rgb(168_85_247_/_0.4)] dark:focus:shadow-[0_0_0_1px_rgb(196_181_253_/_0.4)] transition-all duration-200 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-100"
              >
                <option value="1">Last 1 hour</option>
                <option value="24">Last 24 hours</option>
                <option value="168">Last week</option>
                <option value="720">Last month</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label htmlFor="customTags" className="text-sm font-semibold">
                Custom Tags
              </label>
              <Input
                id="customTags"
                placeholder="e.g., urgent, high-priority, remote"
                value={formData.customTags}
                onChange={(e) => setFormData(prev => ({ ...prev, customTags: e.target.value }))}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Optional tags for organizing your leads
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" type="button" onClick={onCloseAction}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Play className="w-4 h-4 mr-2" />
                Launch Agent
              </Button>
            </div>
          </form>
        ) : (
          // Progress phase
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            {/* Query Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Searching for:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">{formData.query}</p>
            </div>

            {/* Stages */}
            <div className="space-y-4">
              <h4 className="font-medium">Progress Stages</h4>
              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border transition-all duration-300 ${
                      stage.status === 'running' 
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                        : stage.status === 'completed'
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                        : stage.status === 'failed'
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStageIcon(stage)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm">{stage.label}</h5>
                        {getStageStatus(stage)}
                      </div>
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                      {stage.errorMessage && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Error: {stage.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Results */}
            {currentAgent && liveResults && (
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Current Results
                </h4>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {liveResults.jobs.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Jobs Found</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {liveResults.contacts.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Contacts</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {liveResults.campaigns.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Campaigns</div>
                  </div>
                </div>

                {/* Tabbed Live Results */}
                {(liveResults.jobs.length > 0 || liveResults.contacts.length > 0 || liveResults.campaigns.length > 0) && (
                  <div className="bg-white dark:bg-gray-900 rounded-lg border">
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-4">
                        {liveResults.jobs.length > 0 && (
                          <button 
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                          >
                            <Briefcase className="w-3 h-3" />
                            Jobs ({liveResults.jobs.length})
                          </button>
                        )}
                        {liveResults.contacts.length > 0 && (
                          <button 
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                          >
                            <Users className="w-3 h-3" />
                            Contacts ({liveResults.contacts.length})
                          </button>
                        )}
                        {liveResults.campaigns.length > 0 && (
                          <button 
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                          >
                            <Mail className="w-3 h-3" />
                            Campaigns ({liveResults.campaigns.length})
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Latest Results Preview */}
                    <div className="p-4">
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {/* Show latest jobs */}
                        {liveResults.jobs.slice(-3).map((job, index) => (
                          <div key={`job-${index}`} className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-md border">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-purple-700 dark:text-purple-300 truncate">
                                {job.title || 'Software Engineer'}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {job.company || 'Tech Company'} • {job.location || 'Remote'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Badge variant="outline" className="text-xs h-5">
                                {job.site || 'LinkedIn'}
                              </Badge>
                              {job.url && (
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" asChild>
                                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Show latest contacts */}
                        {liveResults.contacts.slice(-2).map((contact, index) => (
                          <div key={`contact-${index}`} className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-md border">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-blue-700 dark:text-blue-300 truncate">
                                {contact.name || `${contact.first_name || 'John'} ${contact.last_name || 'Doe'}`}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {contact.title || 'Hiring Manager'} • {contact.company || 'Company'}
                              </div>
                            </div>
                            <Badge variant="outline" className={`text-xs h-5 ${contact.email ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                              {contact.email ? 'Verified' : 'Found'}
                            </Badge>
                          </div>
                        ))}

                        {/* Show campaigns */}
                        {liveResults.campaigns.map((campaign, index) => (
                          <div key={`campaign-${index}`} className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-md border">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-green-700 dark:text-green-300 truncate">
                                {campaign.name || `${formData.query} Campaign ${index + 1}`}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {campaign.type || 'Email Outreach'} • Ready to launch
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs h-5 bg-green-50 text-green-700 border-green-200">
                              {campaign.status || 'Ready'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      
                      {/* Summary footer */}
                      {(liveResults.jobs.length > 3 || liveResults.contacts.length > 2 || liveResults.campaigns.length > 0) && (
                        <div className="text-xs text-muted-foreground text-center pt-2 border-t mt-2">
                          Showing latest results • Full details available after completion
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              {overallProgress < 100 ? (
                <Button variant="outline" onClick={onCloseAction}>
                  Close & Run in Background
                </Button>
              ) : (
                <Button onClick={onCloseAction} className="bg-gradient-to-r from-green-500 to-emerald-500">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
