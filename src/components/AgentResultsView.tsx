'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Building2, 
  Users, 
  CheckCircle,
  Briefcase,
  MapPin,
  Clock,
  Mail,
  Eye,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { Agent, ProgressiveAgent } from '@/lib/api-production'

interface AgentResultsViewProps {
  agent: Agent | ProgressiveAgent
  isOpen: boolean
  onCloseAction: () => void
}

export default function AgentResultsView({ agent, isOpen, onCloseAction }: AgentResultsViewProps) {
  const router = useRouter()
  const [refreshedAgent, setRefreshedAgent] = useState<Agent | ProgressiveAgent>(agent)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasAutoRefreshed, setHasAutoRefreshed] = useState(false)
  
  // Auto-refresh campaigns seamlessly for completed agents
  useEffect(() => {
    if (!isOpen || hasAutoRefreshed) return
    
    const currentAgent = refreshedAgent
    if ('staged_results' in currentAgent && currentAgent.status === 'completed') {
      const totalCampaigns = currentAgent.staged_results?.total_campaigns || 0
      const realCampaigns = currentAgent.staged_results?.campaigns || []
      
      // If campaigns count doesn't match, auto-refresh seamlessly
      if (totalCampaigns > 0 && realCampaigns.length === 0) {
        console.log('🔄 Auto-refreshing campaigns for completed agent...')
        silentRefresh()
      }
    }
  }, [isOpen, refreshedAgent.status, hasAutoRefreshed])
  
  // Silent refresh for seamless UX
  const silentRefresh = async () => {
    if (!('staged_results' in agent) || hasAutoRefreshed) return
    
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
      const response = await fetch(`${apiBase}/api/agents/progressive/${agent.id}`)
      const data = await response.json()
      
      if (data.agent) {
        setRefreshedAgent(data.agent)
        setHasAutoRefreshed(true)
        console.log('✅ Campaigns auto-synchronized for client')
      }
    } catch (error) {
      console.error('❌ Silent refresh failed:', error)
    }
  }
  
  // Manual refresh for debugging (hidden from client by default)
  const forceRefresh = async () => {
    if (!('staged_results' in agent)) return
    
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
    console.log('🔄 Force refresh - API Base:', apiBase)
    console.log('🔄 Force refresh - Agent ID:', agent.id)
    
    setIsRefreshing(true)
    try {
      const url = `${apiBase}/api/agents/progressive/${agent.id}`
      console.log('🔄 Fetching from URL:', url)
      
      const response = await fetch(url)
      console.log('🔄 Response status:', response.status)
      
      const data = await response.json()
      console.log('🔄 Response data:', data)
      
      if (data.agent) {
        setRefreshedAgent(data.agent)
        setHasAutoRefreshed(true)
        console.log('✅ Agent data refreshed - campaigns:', data.agent.staged_results?.campaigns)
        console.log('✅ Total campaigns:', data.agent.staged_results?.total_campaigns)
      }
    } catch (error) {
      console.error('❌ Failed to refresh agent:', error)
    } finally {
      setIsRefreshing(false)
    }
  }
  
  // Use refreshed data if available
  const currentAgent = refreshedAgent
  
  // Check if this is a progressive agent
  const isProgressive = 'staged_results' in currentAgent
  
  // Check target type for different UI behavior
  const targetType = isProgressive ? (currentAgent as ProgressiveAgent).target_type : 'hiring_managers'
  const isJobCandidates = targetType === 'job_candidates'
  
  // Get totals from agent data
  const totalJobs = isProgressive 
    ? currentAgent.staged_results?.total_jobs || 0
    : currentAgent.total_jobs_found || 0
    
  const totalContacts = isProgressive
    ? currentAgent.staged_results?.total_contacts || 0
    : currentAgent.total_emails_found || 0
    
  const totalCampaigns = isProgressive
    ? currentAgent.staged_results?.total_campaigns || 0
    : 0

  // Get real data arrays if available
  const realJobs = isProgressive 
    ? [...(currentAgent.staged_results?.linkedin_jobs || []), ...(currentAgent.staged_results?.other_jobs || [])]
    : []
  const realContacts = isProgressive ? currentAgent.staged_results?.verified_contacts || [] : []
  const realCampaigns = isProgressive ? currentAgent.staged_results?.campaigns || [] : []

  const hasRealJobData = realJobs.length > 0
  const hasRealContactData = realContacts.length > 0
  const hasRealCampaignData = realCampaigns.length > 0

  // Debug log for campaigns
  console.log('🐛 Frontend Debug - Campaign Data:', {
    agentId: currentAgent.id,
    isProgressive,
    totalCampaigns,
    realCampaigns,
    hasRealCampaignData,
    staged_results: currentAgent.staged_results,
    campaigns_raw: isProgressive ? currentAgent.staged_results?.campaigns : 'not progressive'
  })
  
  // Additional debug for campaign detection logic
  if (isProgressive && totalCampaigns > 0) {
    console.log('🎯 CAMPAIGN DETECTION:')
    console.log('  ✅ Is Progressive Agent')
    console.log('  ✅ Total Campaigns > 0:', totalCampaigns)
    console.log('  📊 Real Campaigns Array:', realCampaigns)
    console.log('  🔍 Has Real Campaign Data:', hasRealCampaignData)
    console.log('  📝 Should show campaigns?', hasRealCampaignData ? 'YES' : 'NO (showing fallback)')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Agent Results: {currentAgent.query}
            </div>
            {/* Only show refresh button in development mode */}
            {isProgressive && process.env.NODE_ENV === 'development' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={forceRefresh} 
                disabled={isRefreshing}
                className="ml-2"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Refresh Data
                  </>
                )}
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {isJobCandidates 
              ? `Professional candidates found for "${currentAgent.query}" role`
              : `Companies and hiring managers for "${currentAgent.query}" positions`
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value={isJobCandidates ? "candidates" : "jobs"}>
              {isJobCandidates ? `Candidates (${totalContacts})` : `Jobs (${totalJobs})`}
            </TabsTrigger>
            <TabsTrigger value="contacts">
              {isJobCandidates ? `Profiles (${totalContacts})` : `Contacts (${totalContacts})`}
            </TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns ({totalCampaigns})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 overflow-y-auto max-h-[60vh]">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isJobCandidates ? 'Candidates Found' : 'Jobs Found'}
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isJobCandidates ? totalContacts.toLocaleString() : totalJobs.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isJobCandidates 
                      ? (hasRealContactData ? 'Professional profiles' : 'Qualified candidates')
                      : (hasRealJobData ? 'Live job openings' : 'From multiple job boards')
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isJobCandidates ? 'Profiles Enriched' : 'Contacts Found'}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalContacts.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {isJobCandidates
                      ? (hasRealContactData ? 'With contact details' : 'Complete candidate profiles')
                      : (hasRealContactData ? 'Verified hiring managers' : 'Decision makers')
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Campaigns Created</CardTitle>
                  <Mail className="h-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCampaigns}</div>
                  <p className="text-xs text-muted-foreground">
                    {hasRealCampaignData ? 'Live campaigns' : 'Ready for outreach'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Agent Details */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Search Query</label>
                    <p className="text-sm">{agent.query}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="text-sm">
                      <Badge variant={agent.status === 'completed' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">{new Date(agent.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-sm">{isProgressive ? 'Progressive Agent' : 'Standard Agent'}</p>
                  </div>
                </div>
                {agent.custom_tags && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(typeof agent.custom_tags === 'string' 
                        ? agent.custom_tags.split(',') 
                        : agent.custom_tags
                      ).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Access Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-4 w-4 text-blue-500" />
                  Access Your Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your agent has successfully completed and found {totalJobs} jobs and {totalContacts} contacts. 
                  Access the detailed results through the following sections:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-purple-500" />
                      <div>
                        <h4 className="font-medium">Job Opportunities</h4>
                        <p className="text-sm text-muted-foreground">{totalJobs} jobs found across multiple platforms</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push('/leads')}>
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View in Lead Database
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-green-500" />
                      <div>
                        <h4 className="font-medium">Contact Information</h4>
                        <p className="text-sm text-muted-foreground">{totalContacts} verified decision makers</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push('/leads')}>
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View in Lead Database
                    </Button>
                  </div>

                  {totalCampaigns > 0 && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">Email Campaigns</h4>
                          <p className="text-sm text-muted-foreground">{totalCampaigns} campaigns ready to launch</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={onCloseAction}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View in Campaigns
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs/Candidates Tab - Dynamic based on target type */}
          <TabsContent value={isJobCandidates ? "candidates" : "jobs"} className="space-y-4 overflow-y-auto max-h-[60vh]">
            {isJobCandidates ? (
              // Show candidate profiles for job_candidates
              hasRealContactData ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Showing first {Math.min(realContacts.length, 10)} candidates for "{agent.query}" role:
                  </p>
                  {realContacts.slice(0, 10).map((contact: any, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{contact.name || contact.full_name || 'Professional'}</h3>
                            {contact.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                          <p className="text-sm font-medium text-blue-600">{contact.title || contact.role || agent.query}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {contact.company || 'Company'}
                            </span>
                            {contact.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {contact.location}
                              </span>
                            )}
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </div>
                          )}
                          {contact.experience_years && (
                            <Badge variant="outline">{contact.experience_years} years experience</Badge>
                          )}
                          {contact.source && (
                            <Badge variant="outline">{contact.source}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {realContacts.length > 10 && (
                    <p className="text-sm text-center text-muted-foreground">
                      ... and {realContacts.length - 10} more candidates. View all in Lead Database.
                    </p>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Candidates Found: {totalContacts}</h3>
                    <p className="text-muted-foreground mb-4">
                      Your agent found {totalContacts} qualified "{agent.query}" professionals. The detailed candidate profiles are available in the Lead Database.
                    </p>
                    <Button 
                      onClick={() => {
                        onCloseAction()
                        router.push('/dashboard?tab=leads')
                      }}
                    >
                      Go to Lead Database
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : (
              // Show job listings for hiring_managers
              hasRealJobData ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Showing first {Math.min(realJobs.length, 10)} jobs from your agent search:
                  </p>
                  {realJobs.slice(0, 10).map((job: any, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{job.title || job.job_title || 'Job Title'}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {job.company || job.company_name || 'Company'}
                            </span>
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.location}
                              </span>
                            )}
                            {job.posted_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {job.posted_date}
                              </span>
                            )}
                          </div>
                          {job.source && (
                            <Badge variant="outline">{job.source}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {realJobs.length > 10 && (
                    <p className="text-sm text-center text-muted-foreground">
                      ... and {realJobs.length - 10} more jobs. View all in Lead Database.
                    </p>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Jobs Found: {totalJobs}</h3>
                    <p className="text-muted-foreground mb-4">
                      Your agent successfully found {totalJobs} job opportunities. The detailed job listings are available in the Lead Database section of your dashboard.
                    </p>
                    <Button 
                      onClick={() => {
                        onCloseAction()
                        router.push('/dashboard?tab=leads')
                      }}
                    >
                      Go to Lead Database
                    </Button>
                  </CardContent>
                </Card>
              )
            )}
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4 overflow-y-auto max-h-[60vh]">
            {hasRealContactData ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Showing first {Math.min(realContacts.length, 10)} contacts from your agent search:
                </p>
                {realContacts.slice(0, 10).map((contact: any, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contact.name || contact.full_name || 'Contact Name'}</h3>
                          {contact.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.role || contact.title || 'Role'}</p>
                        <p className="text-sm text-muted-foreground">{contact.company || contact.company_name || 'Company'}</p>
                        <div className="flex items-center gap-3 text-sm">
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {realContacts.length > 10 && (
                  <p className="text-sm text-center text-muted-foreground">
                    ... and {realContacts.length - 10} more contacts. View all in Lead Database.
                  </p>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Contacts Found: {totalContacts}</h3>
                  <p className="text-muted-foreground mb-4">
                    Your agent successfully found {totalContacts} verified contacts. The detailed contact information is available in the Lead Database section of your dashboard.
                  </p>
                  <Button 
                    onClick={() => {
                      onCloseAction()
                      router.push('/dashboard?tab=leads')
                    }}
                  >
                    Go to Lead Database
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4 overflow-y-auto max-h-[60vh]">
            {hasRealCampaignData ? (
              <div className="space-y-3">
                {realCampaigns.map((campaign: any, index) => (
                  <Card key={campaign.campaign_id || index}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold">
                          {campaign.campaign_name || campaign.name || `Campaign ${index + 1}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {campaign.search_type ? `${campaign.search_type.toUpperCase()} Campaign` : 'Email campaign'}
                          {campaign.auto_campaign && ' (Auto-created)'}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">
                            {campaign.send_scheduled ? 'Scheduled' : campaign.status || 'Ready'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {campaign.target_count || campaign.contact_count || 0} contacts
                          </span>
                          {campaign.verified_count && (
                            <span className="text-sm text-green-600">
                              {campaign.verified_count} verified
                            </span>
                          )}
                          {campaign.send_delay_hours && (
                            <span className="text-xs text-muted-foreground">
                              Delay: {campaign.send_delay_hours}h
                            </span>
                          )}
                        </div>
                        {campaign.created_at && (
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(campaign.created_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : totalCampaigns > 0 && !hasAutoRefreshed ? (
              // Show loading state when campaigns exist but aren't loaded yet
              <Card>
                <CardContent className="pt-6 text-center">
                  <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold mb-2">Loading Campaign Details...</h3>
                  <p className="text-muted-foreground mb-4">
                    Synchronizing {totalCampaigns} campaign{totalCampaigns > 1 ? 's' : ''} with latest data...
                  </p>
                </CardContent>
              </Card>
            ) : totalCampaigns > 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Campaigns Created: {totalCampaigns}</h3>
                  <p className="text-muted-foreground mb-4">
                    Your agent created {totalCampaigns} email campaigns. View and manage them in the Campaigns section of your dashboard.
                  </p>
                  <Button onClick={onCloseAction}>
                    Go to Campaigns
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Campaigns will be automatically created when your agent completes contact discovery, or you can create them manually using your found contacts.
                  </p>
                  <Button onClick={onCloseAction}>
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
