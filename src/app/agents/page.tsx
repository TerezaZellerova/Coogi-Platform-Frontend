'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient, type Agent, type JobSearchResults, type ProgressiveAgent } from '@/lib/api-production'
import JobAnalysisResults from '@/components/JobAnalysisResults'
import LoadingSimulation from '@/components/LoadingSimulation'
import { ProgressiveAgentCard } from '@/components/ProgressiveAgentCard'
import { NotificationSystem, useNotifications } from '@/components/NotificationSystem'
import { 
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Download,
  Users,
  Briefcase,
  Mail,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Eye
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Analysis results state
  const [analysisResults, setAnalysisResults] = useState<JobSearchResults | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Loading simulation state
  const [showLoadingSimulation, setShowLoadingSimulation] = useState(false)
  const [forceComplete, setForceComplete] = useState(false)
  
  // Add results persistence
  const [agentResults, setAgentResults] = useState<Record<string, JobSearchResults>>({})

  // Progressive agents state
  const [progressiveAgents, setProgressiveAgents] = useState<ProgressiveAgent[]>([])
  const [useProgressiveMode, setUseProgressiveMode] = useState(true) // Default to progressive mode

  // Notification system
  const { 
    notifications, 
    dismissNotification, 
    notifySuccess, 
    notifyError, 
    notifyStageComplete,
    notifyInfo 
  } = useNotifications()

  // Load stored results from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agentResults')
      if (stored) {
        try {
          setAgentResults(JSON.parse(stored))
        } catch (error) {
          console.error('Error loading stored results:', error)
        }
      }
    }
  }, [])

  // New agent form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAgent, setNewAgent] = useState({
    query: '',
    hoursOld: '24',
    customTags: '',
    targetType: 'hiring_managers',
    companySize: 'all',
    locationFilter: ''
  })

  useEffect(() => {
    // Only check authentication on client side
    if (typeof window === 'undefined') return
    
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }
    loadAgents()
  }, [])

  const loadAgents = async () => {
    setLoading(true)
    try {
      const fetchedAgents = await apiClient.getAgents()
      setAgents(fetchedAgents)
    } catch (error) {
      console.error('Error loading agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAgent.query.trim()) return

    setActionLoading('create')
    
    try {
      // Construct enhanced query string with location and company size
      let enhancedQuery = newAgent.query.trim()
      
      // Add location filter if provided
      if (newAgent.locationFilter.trim()) {
        enhancedQuery += ` in ${newAgent.locationFilter.trim()}`
      }
      
      // Add company size filter if not 'all'
      if (newAgent.companySize !== 'all') {
        if (newAgent.companySize === 'small') {
          enhancedQuery += ' at 1-100 employee companies'
        } else if (newAgent.companySize === 'medium') {
          enhancedQuery += ' at 100-1000 employee companies'
        }
      }
      
      if (useProgressiveMode) {
        // Create progressive agent for instant LinkedIn results
        const response = await apiClient.createProgressiveAgent(
          enhancedQuery,
          parseInt(newAgent.hoursOld),
          newAgent.customTags.trim() || undefined
        )
        
        // Add to progressive agents list
        setProgressiveAgents(prev => [response.agent, ...prev])
        
        // Notify user of successful creation
        notifySuccess(
          'Agent Created!', 
          'Your agent is starting to fetch LinkedIn jobs...',
          response.agent.id
        )
        
        // Track stage completion for notifications
        let previousStages = new Set<string>()
        
        // Start polling for updates with error handling
        const cleanupPolling = apiClient.pollProgressiveAgent(
          response.agent.id,
          (updatedAgent) => {
            setProgressiveAgents(prev => 
              prev.map(agent => agent.id === updatedAgent.id ? updatedAgent : agent)
            )
            
            // Check for newly completed stages
            Object.entries(updatedAgent.stages).forEach(([stageName, stage]) => {
              if (stage.status === 'completed' && !previousStages.has(stageName)) {
                previousStages.add(stageName)
                
                const stageLabels: Record<string, string> = {
                  linkedin_fetch: 'LinkedIn Jobs',
                  other_boards: 'Other Job Boards',
                  contact_enrichment: 'Contact Discovery',
                  campaign_creation: 'Campaign Creation'
                }
                
                notifyStageComplete(
                  `${stageLabels[stageName] || stageName} Complete!`,
                  `Found ${stage.results_count} results`,
                  updatedAgent.id
                )
              }
            })
          },
          (completedAgent) => {
            setProgressiveAgents(prev => 
              prev.map(agent => agent.id === completedAgent.id ? completedAgent : agent)
            )
            
            notifySuccess(
              'Agent Completed!',
              `All stages finished with ${completedAgent.staged_results.total_jobs} total jobs found`,
              completedAgent.id
            )
            
            console.log('✅ Progressive agent completed:', completedAgent.id)
          },
          (error) => {
            console.error('❌ Progressive agent polling error:', error)
            notifyError(
              'Agent Connection Error',
              error,
              response.agent.id
            )
          }
        )
        
        console.log('🚀 Progressive agent created:', response.agent.id)
        
      } else {
        // Use legacy mode with loading simulation
        setShowLoadingSimulation(true)
        setForceComplete(false)
        
        notifyInfo(
          'Creating Agent',
          'Preparing legacy agent with full processing...'
        )
        
        const response = await apiClient.createAgent(
          enhancedQuery,
          parseInt(newAgent.hoursOld),
          newAgent.customTags.trim() || undefined
        )
        
        // Force loading simulation to complete when API finishes
        setForceComplete(true)
        
        // Store the analysis results both in state and localStorage
        setAnalysisResults(response.results)
        
        // Persist results for this agent
        const newAgentResults = {
          ...agentResults,
          [response.agent.id]: response.results
        }
        setAgentResults(newAgentResults)
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('agentResults', JSON.stringify(newAgentResults))
        }
        
        // Add just the agent to the list
        setAgents(prev => [response.agent, ...prev])
        
        notifySuccess(
          'Legacy Agent Created!',
          `Analysis complete with ${response.results.jobs_found} jobs found`,
          response.agent.id
        )
        
        console.log('✅ Legacy agent created successfully:', response.agent.id)
      }
      
      setNewAgent({ query: '', hoursOld: '24', customTags: '', targetType: 'hiring_managers', companySize: 'all', locationFilter: '' })
      setShowCreateForm(false)
      
    } catch (error) {
      console.error('Error creating agent:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      notifyError(
        'Failed to Create Agent',
        errorMessage
      )
      
      // Reset loading states
      setShowLoadingSimulation(false)
      setForceComplete(false)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAgentAction = async (agentId: string, action: 'pause' | 'resume' | 'delete') => {
    setActionLoading(agentId)
    try {
      if (action === 'delete') {
        await apiClient.deleteAgent(agentId)
        setAgents(prev => prev.filter(agent => agent.id !== agentId))
      } else {
        // Update agent status locally
        const newStatus = action === 'pause' ? 'paused' : 'running'
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? { ...agent, status: newStatus } : agent
        ))
      }
    } catch (error) {
      console.error(`Error ${action}ing agent:`, error)
      alert(`Failed to ${action} agent`)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.query.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Agent['status']) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', icon: any, color: string }> = {
      running: { variant: 'default' as const, icon: Play, color: 'text-green-600' },
      paused: { variant: 'secondary' as const, icon: Pause, color: 'text-yellow-600' },
      completed: { variant: 'outline' as const, icon: CheckCircle, color: 'text-blue-600' },
      failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      processing: { variant: 'default' as const, icon: Activity, color: 'text-blue-600' }
    }
    
    const { variant, icon: StatusIcon, color } = config[status] || config.failed
    
    return (
      <Badge variant={variant} className={`${color} flex items-center gap-1`}>
        <StatusIcon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const getStatsOverview = () => {
    const running = agents.filter(a => a.status === 'running').length
    const completed = agents.filter(a => a.status === 'completed').length
    const totalJobs = agents.reduce((sum, a) => sum + (a.total_jobs_found || 0), 0)
    const totalEmails = agents.reduce((sum, a) => sum + (a.total_emails_found || 0), 0)
    
    return { running, completed, totalJobs, totalEmails }
  }

  const stats = getStatsOverview()

  // Handle loading simulation completion
  const handleLoadingComplete = () => {
    setShowLoadingSimulation(false)
    // Show results after loading completes
    if (analysisResults) {
      setShowResults(true)
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
                onClick={() => router.push('/')}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Agent Management
                  </h1>
                  <p className="text-xs text-muted-foreground">Create, monitor, and manage your lead generation agents</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={loadAgents} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Agent
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Running Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.running}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.completed}</div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Finished tasks</p>
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
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.totalJobs.toLocaleString()}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Total opportunities</p>
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
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.totalEmails.toLocaleString()}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Verified contacts</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Agent Form */}
        {showCreateForm && (
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Create New Agent
              </CardTitle>
              <CardDescription>Configure a new lead generation agent with advanced targeting</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAgent} className="space-y-6">
                {/* Target Type Selection */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <label className="text-sm font-semibold text-blue-900 dark:text-blue-100 block mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Target Type - Who are you trying to reach? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors">
                      <input
                        type="radio"
                        id="targetHiringManagers"
                        name="targetType"
                        value="hiring_managers"
                        checked={newAgent.targetType === 'hiring_managers'}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, targetType: e.target.value }))}
                        className="text-blue-600"
                      />
                      <label htmlFor="targetHiringManagers" className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Hiring Managers
                        </div>
                        <div className="text-xs text-muted-foreground">Target companies posting jobs (they're hiring)</div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900 transition-colors">
                      <input
                        type="radio"
                        id="targetCandidates"
                        name="targetType"
                        value="candidates"
                        checked={newAgent.targetType === 'candidates'}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, targetType: e.target.value }))}
                        className="text-green-600"
                      />
                      <label htmlFor="targetCandidates" className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Job Candidates
                        </div>
                        <div className="text-xs text-muted-foreground">Target professionals in specific roles</div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Search Query with Smart Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Search Query *
                      {newAgent.targetType === 'hiring_managers' && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          Job Titles
                        </span>
                      )}
                      {newAgent.targetType === 'candidates' && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          Professional Roles
                        </span>
                      )}
                    </label>
                    <Input
                      placeholder={
                        newAgent.targetType === 'hiring_managers' 
                          ? "e.g., software engineer, marketing manager, nurse"
                          : "e.g., senior developer, marketing director, head nurse"
                      }
                      value={newAgent.query}
                      onChange={(e) => setNewAgent(prev => ({ ...prev, query: e.target.value }))}
                      required
                    />
                    {newAgent.targetType === 'hiring_managers' && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Will find companies posting these job types (they need to hire)
                      </p>
                    )}
                    {newAgent.targetType === 'candidates' && (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Will find professionals currently in these roles
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Job Timeframe
                    </label>
                    <select
                      value={newAgent.hoursOld}
                      onChange={(e) => setNewAgent(prev => ({ ...prev, hoursOld: e.target.value }))}
                      className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="1">Last 1 hour</option>
                      <option value="24">Last 24 hours</option>
                      <option value="168">Last week</option>
                      <option value="720">Last month</option>
                    </select>
                  </div>
                </div>

                {/* Company Size Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Company Size Target
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <input
                        type="radio"
                        id="smallCompanies"
                        name="companySize"
                        value="small"
                        checked={newAgent.companySize === 'small'}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, companySize: e.target.value }))}
                      />
                      <label htmlFor="smallCompanies" className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm">Small (1-100)</div>
                        <div className="text-xs text-muted-foreground">Easy to reach decision makers</div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <input
                        type="radio"
                        id="mediumCompanies"
                        name="companySize"
                        value="medium"
                        checked={newAgent.companySize === 'medium'}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, companySize: e.target.value }))}
                      />
                      <label htmlFor="mediumCompanies" className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm">Medium (100-1000)</div>
                        <div className="text-xs text-muted-foreground">Growing companies</div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <input
                        type="radio"
                        id="allCompanies"
                        name="companySize"
                        value="all"
                        checked={newAgent.companySize === 'all'}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, companySize: e.target.value }))}
                      />
                      <label htmlFor="allCompanies" className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm">All Sizes</div>
                        <div className="text-xs text-muted-foreground">No size restrictions</div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Custom Tags
                    </label>
                    <Input
                      placeholder="e.g., urgent, priority, fintech"
                      value={newAgent.customTags}
                      onChange={(e) => setNewAgent(prev => ({ ...prev, customTags: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location Filter
                    </label>
                    <Input
                      placeholder="e.g., New York, remote, San Francisco"
                      value={newAgent.locationFilter}
                      onChange={(e) => setNewAgent(prev => ({ ...prev, locationFilter: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Strategy Explanation */}
                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-amber-900 dark:text-amber-100 mb-2">Agent Strategy:</div>
                      {newAgent.targetType === 'hiring_managers' ? (
                        <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                          <li>• Find companies posting jobs matching your query</li>
                          <li>• Identify companies without large TA teams (easier to reach)</li>
                          <li>• Extract hiring managers and decision-makers from these companies</li>
                          <li>• Perfect for recruiting placement opportunities</li>
                        </ul>
                      ) : (
                        <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                          <li>• Find professionals currently working in these roles</li>
                          <li>• Extract contact information of potential candidates</li>
                          <li>• Target passive candidates who might be open to new opportunities</li>
                          <li>• Perfect for direct candidate outreach</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={actionLoading === 'create' || !newAgent.query.trim() || !newAgent.targetType}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {actionLoading === 'create' ? 'Creating...' : 'Create Agent'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
          <span className="text-sm font-medium">Agent Mode:</span>
          <div className="flex items-center gap-2">
            <Button
              variant={useProgressiveMode ? "default" : "outline"}
              size="sm"
              onClick={() => setUseProgressiveMode(true)}
              className={useProgressiveMode ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : ""}
            >
              ⚡ Progressive (Fast LinkedIn)
            </Button>
            <Button
              variant={!useProgressiveMode ? "default" : "outline"}
              size="sm"
              onClick={() => setUseProgressiveMode(false)}
            >
              🔄 Legacy (Full Pipeline)
            </Button>
          </div>
        </div>

        {/* Agent Tabs */}
        <Tabs defaultValue={useProgressiveMode ? "progressive" : "legacy"} value={useProgressiveMode ? "progressive" : "legacy"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progressive" onClick={() => setUseProgressiveMode(true)}>
              Progressive Agents ({progressiveAgents.length})
            </TabsTrigger>
            <TabsTrigger value="legacy" onClick={() => setUseProgressiveMode(false)}>
              Legacy Agents ({agents.length})
            </TabsTrigger>
          </TabsList>

          {/* Progressive Agents Tab */}
          <TabsContent value="progressive" className="space-y-6">
            {progressiveAgents.length === 0 ? (
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Progressive Agents</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a progressive agent to get LinkedIn results in 2-3 minutes
                  </p>
                  <Button 
                    onClick={() => setShowCreateForm(true)} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Progressive Agent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {progressiveAgents.map((agent) => (
                  <ProgressiveAgentCard 
                    key={agent.id} 
                    agent={agent}
                    onUpdate={(updatedAgent) => {
                      setProgressiveAgents(prev => 
                        prev.map(a => a.id === updatedAgent.id ? updatedAgent : a)
                      )
                    }}
                    onRemove={(agentId) => {
                      setProgressiveAgents(prev => 
                        prev.filter(a => a.id !== agentId)
                      )
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Legacy Agents Tab */}
          <TabsContent value="legacy" className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="running">Running</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {filteredAgents.length} of {agents.length} agents
                </Badge>
              </div>
            </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredAgents.length} of {agents.length} agents
            </Badge>
          </div>
        </div>

        {/* Agents Table */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              All Agents
            </CardTitle>
            <CardDescription>Monitor and control your lead generation agents</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-muted-foreground">Loading agents...</p>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Agents Found</h3>
                <p className="text-muted-foreground mb-4">
                  {agents.length === 0 ? 'Create your first agent to start generating leads' : 'No agents match your current filters'}
                </p>
                {agents.length === 0 && (
                  <Button onClick={() => setShowCreateForm(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Agent
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-purple-500" />
                          <span className="text-slate-600 dark:text-slate-400">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{agent.total_jobs_found || 0}</span> jobs
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-green-500" />
                          <span className="text-slate-600 dark:text-slate-400">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{agent.total_emails_found || 0}</span> emails
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-orange-500" />
                          <span className="text-slate-600 dark:text-slate-400 capitalize">
                            {agent.status}
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
                      {agent.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Check if we have stored results for this agent
                            const storedResults = agentResults[agent.id]
                            if (storedResults) {
                              setAnalysisResults(storedResults)
                              setShowResults(true)
                            } else {
                              // Show demo results if no stored results found
                              setAnalysisResults({
                                companies_analyzed: [
                                  {
                                    company: "Demo Company",
                                    job_title: "Software Engineer", 
                                    job_url: "https://example.com",
                                    job_source: "LinkedIn (RapidAPI)",
                                    has_ta_team: false,
                                    contacts_found: 3,
                                    top_contacts: [
                                      { name: "John Doe", title: "Engineering Manager" }
                                    ],
                                  recommendation: "TARGET - Great opportunity",
                                  timestamp: new Date().toISOString()
                                }
                              ],
                              jobs_found: 25,
                              total_processed: 5,
                              search_query: agent.query,
                              timestamp: new Date().toISOString()
                            })
                            setShowResults(true)
                            }
                          }}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {agent.status === 'running' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAgentAction(agent.id, 'pause')}
                          disabled={actionLoading === agent.id}
                          className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAgentAction(agent.id, 'resume')}
                          disabled={actionLoading === agent.id}
                          className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAgentAction(agent.id, 'delete')}
                        disabled={actionLoading === agent.id}
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Job Analysis Results Modal */}
      {showResults && analysisResults && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Job Analysis Results</h2>
              <Button 
                variant="outline" 
                onClick={() => setShowResults(false)}
                className="text-slate-600 hover:text-slate-800"
              >
                ✕ Close
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <JobAnalysisResults 
                results={analysisResults} 
                onClose={() => setShowResults(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading Simulation */}
      <LoadingSimulation 
        isVisible={showLoadingSimulation}
        onCompleteAction={handleLoadingComplete}
        forceComplete={forceComplete}
      />

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        onDismissAction={dismissNotification}
      />
    </div>
  )
}
