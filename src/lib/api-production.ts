// Production API client for COOGI platform
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://coogi-backend-7yca.onrender.com'

export interface Agent {
  id: string
  query: string
  status: 'running' | 'paused' | 'completed' | 'failed' | 'processing'
  created_at: string
  total_jobs_found: number
  total_emails_found: number
  hours_old?: number
  custom_tags?: string | string[] // Support both for backward compatibility
  batch_id?: string
  processed_cities?: number
  processed_companies?: number
  start_time?: string
  end_time?: string
  staged_results?: {
    linkedin_jobs?: any[]
    other_jobs?: any[]
    verified_contacts?: any[]
    campaigns?: any[]
  }
  stages?: Record<string, {
    name: string
    progress: number
    results_count?: number
  }>
  total_progress?: number
}

export interface DashboardStats {
  activeAgents: number
  totalRuns: number
  totalJobs: number
  successRate: number
}

export interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'draft'
  leads_count: number
  open_rate?: number
  reply_rate?: number
  created_at: string
  batch_id?: string
}

export interface Lead {
  id: string
  email: string
  first_name: string
  last_name: string
  company: string
  title: string
  linkedin_url?: string
  campaign_id?: string
  status: 'active' | 'bounced' | 'replied' | 'unsubscribed'
  confidence?: string
  timestamp?: string
}

export interface Contact {
  name: string
  title: string
  linkedin_url?: string
  email?: string
}

export interface CompanyAnalysis {
  company: string
  job_title: string
  job_url: string
  job_source?: string  // Make this optional since it can be undefined
  has_ta_team: boolean
  contacts_found: number
  top_contacts: Contact[]
  hunter_emails?: any[]
  employee_roles?: string[]
  company_website?: string
  company_found?: boolean
  recommendation: string
  instantly_campaign_id?: string
  timestamp: string
}

export interface JobSearchResults {
  companies_analyzed: CompanyAnalysis[]
  jobs_found: number
  total_processed: number
  search_query: string
  timestamp: string
  campaigns_created?: string[]
  leads_added?: number
}

export interface JobSearchRequest {
  query: string
  hours_old?: number
  custom_tags?: string
}

export interface JobSearchResponse {
  success: boolean
  batch_id: string
  message: string
  estimated_jobs?: number
}

// Real-time monitoring interfaces
export interface AgentLog {
  id: string
  batch_id: string
  message: string
  level: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  company?: string
  email?: string
}

export interface AgentStatus {
  status: 'running' | 'paused' | 'completed' | 'failed' | 'processing'
  message: string
  progress?: number
  jobs_found?: number
  emails_found?: number
  processed_cities?: number
  processed_companies?: number
  start_time?: string
  end_time?: string
}

// Agent templates interface
export interface AgentTemplate {
  id: string
  name: string
  query: string
  hours_old: number
  custom_tags?: string | string[] // Support both for backward compatibility
  description?: string
  created_at: string
  is_favorite?: boolean
}

// System health interface
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  uptime: number
  memory_usage: number
  cpu_usage: number
  active_connections: number
  last_check?: string
}

// Progressive Agent Types
export interface AgentStage {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  started_at?: string
  completed_at?: string
  error_message?: string
  results_count: number
}

export interface StagedResults {
  linkedin_jobs: any[]
  other_jobs: any[]
  verified_contacts: any[]
  campaigns: any[]
  total_jobs: number
  total_contacts: number
  total_campaigns: number
}

export interface ProgressiveAgent {
  id: string
  query: string
  status: 'initializing' | 'linkedin_stage' | 'enrichment_stage' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  total_progress: number
  stages: Record<string, AgentStage>
  staged_results: StagedResults
  hours_old: number
  custom_tags?: string[]
  final_stats?: Record<string, any>
}

export interface ProgressiveAgentResponse {
  agent: ProgressiveAgent
  message: string
  next_update_in_seconds: number
}

// Progressive Agent Data Types
export interface ProgressiveJob {
  id: number
  agent_id: string
  job_id?: string
  title: string
  company: string
  location?: string
  url?: string
  description?: string
  posted_date?: string
  employment_type?: string
  experience_level?: string
  salary?: string
  site: string
  company_url?: string
  is_remote: boolean
  skills?: string[]
  is_demo: boolean
  scraped_at: string
  created_at: string
}

export interface ProgressiveContact {
  id: number
  agent_id: string
  contact_id?: string
  name?: string
  first_name?: string
  last_name?: string
  email?: string
  company?: string
  role?: string
  title?: string
  linkedin_url?: string
  phone?: string
  verified: boolean
  source: string
  confidence_score?: number
  created_at: string
}

export interface ProgressiveCampaign {
  id: number
  agent_id: string
  campaign_id?: string
  name: string
  type: string
  status: string
  subject?: string
  content?: string
  target_count: number
  sent_count: number
  open_count: number
  reply_count: number
  platform: string
  created_at: string
  updated_at: string
}

export interface DashboardStatsEnhanced {
  total_jobs: number
  total_contacts: number
  total_campaigns: number
  active_agents: number
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return {
        'Content-Type': 'application/json'
      }
    }
    
    const authData = localStorage.getItem('coogiAuth')
    if (authData) {
      try {
        const auth = JSON.parse(authData)
        return {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      } catch (error) {
        console.error('Error parsing auth data:', error)
      }
    }
    return {
      'Content-Type': 'application/json'
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = await this.getAuthHeaders()
    
    // Add timeout for long-running requests (real job scraping takes time)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout for real data processing
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out after 20 minutes')
      }
      throw error
    }
  }

  // Authentication
  async login(email: string, password: string) {
    try {
      console.log('Login attempt with API base:', this.baseUrl)
      console.log('⏳ Connecting to backend...')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store',
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Login response status:', response.status)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed')
      }

      // Store auth data in localStorage (only on client side)
      const authData = {
        token: data.token,
        user: data.user,
        loginTime: new Date().toISOString()
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('coogiAuth', JSON.stringify(authData))
      }
      
      console.log('✅ Login successful!')
      return authData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async signup(email: string, password: string) {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Signup failed')
    }

    const data = await response.json()
    
    // Store authentication data
    if (typeof window !== 'undefined') {
      localStorage.setItem('coogiAuth', JSON.stringify({
        token: data.access_token,
        email: data.user.email,
        isAuthenticated: true
      }))
    }

    return data
  }

  async logout() {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      localStorage.removeItem('coogiAuth')
      localStorage.removeItem('token') // Also remove old demo token if exists
    }
  }

  isAuthenticated(): boolean {
    // Check if we're on the client side
    if (typeof window === 'undefined') return false
    
    const authData = localStorage.getItem('coogiAuth')
    if (!authData) return false
    
    try {
      const auth = JSON.parse(authData)
      return !!(auth.token && auth.user)
    } catch {
      return false
    }
  }

  getCurrentUser() {
    // Check if we're on the client side
    if (typeof window === 'undefined') return null
    
    const authData = localStorage.getItem('coogiAuth')
    if (!authData) return null
    
    try {
      const auth = JSON.parse(authData)
      return auth.user
    } catch {
      return null
    }
  }

  // Dashboard Stats - Real backend data
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.request('/api/leads/dashboard-stats')
    // Map the response format to expected DashboardStats format
    return {
      activeAgents: response.data.active_agents || 0,
      totalRuns: response.data.total_campaigns || 0, // Use campaigns as "runs"
      totalJobs: response.data.total_jobs || 0,
      successRate: 100 // Default success rate, can be calculated later
    }
  }

  // Agent Management
  async getAgents(): Promise<Agent[]> {
    return await this.request('/api/agents')
  }

  async createAgent(query: string, hoursOld: number = 24, customTags?: string): Promise<{ agent: Agent, results: JobSearchResults }> {
    console.log('🚀 Creating real agent with backend processing...')
    
    // Create the agent with real backend processing
    const response = await this.request('/api/search-jobs', {
      method: 'POST',
      body: JSON.stringify({
        query,
        hours_old: hoursOld,
        enforce_salary: true,
        auto_generate_messages: true,
        create_campaigns: true,
        custom_tags: customTags ? [customTags] : undefined
      })
    })

    console.log('✅ Agent creation response:', response)

    // Create agent data from the response
    const agent: Agent = {
      id: response.batch_id || `agent_${Date.now()}`,
      query: query,
      status: 'running', // Real agents start as running and may take time to complete
      created_at: new Date().toISOString(),
      total_jobs_found: response.estimated_jobs || 0,
      total_emails_found: 0, // Will be updated as it processes
      hours_old: hoursOld,
      custom_tags: customTags,
      batch_id: response.batch_id
    }

    // For real agents, return minimal results since processing happens in background
    const results: JobSearchResults = {
      companies_analyzed: [],
      jobs_found: response.estimated_jobs || 0,
      total_processed: 0,
      search_query: query,
      timestamp: new Date().toISOString(),
      campaigns_created: [],
      leads_added: 0
    }

    console.log('📝 Agent created:', agent.id, 'Processing in background...')
    return { agent, results }
  }

  async deleteAgent(id: string): Promise<void> {
    try {
      await this.request(`/api/agents/${id}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Error deleting agent:', error)
      throw error
    }
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    try {
      const response = await this.request(`/api/agents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      })
      return response.agent
    } catch (error) {
      console.error('Error updating agent:', error)
      throw error
    }
  }

  // Campaign Management
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await this.request('/api/leads/campaigns')
      // Transform the response to match the expected Campaign interface
      if (response.success && response.data) {
        return response.data.map((campaign: any) => ({
          id: campaign.campaign_id || campaign.id,
          name: campaign.name,
          status: campaign.status,
          leads_count: campaign.target_count || 0,
          open_rate: (campaign.open_count / Math.max(campaign.sent_count, 1)) * 100 || 0,
          reply_rate: (campaign.reply_count / Math.max(campaign.sent_count, 1)) * 100 || 0,
          created_at: campaign.created_at,
          batch_id: campaign.agent_id
        }))
      }
      return []
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }
  }

  async createCampaign(name: string, leadIds: string[]): Promise<Campaign> {
    try {
      const response = await this.request('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name,
          lead_ids: leadIds
        })
      })

      return response
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw error
    }
  }

  // Lead Management
  async getLeads(): Promise<Lead[]> {
    try {
      return await this.request('/api/leads')
    } catch (error) {
      console.error('Error fetching leads:', error)
      return []
    }
  }

  // Lead Data Management - Real backend data for dashboard
  async getLeadJobs(limit: number = 100): Promise<{ success: boolean; data: ProgressiveJob[] }> {
    try {
      const response = await this.request(`/api/leads/jobs?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching lead jobs:', error)
      return { success: false, data: [] }
    }
  }

  async getLeadContacts(limit: number = 100): Promise<{ success: boolean; data: ProgressiveContact[] }> {
    try {
      const response = await this.request(`/api/leads/contacts?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching lead contacts:', error)
      return { success: false, data: [] }
    }
  }

  async getLeadCampaigns(): Promise<{ success: boolean; data: ProgressiveCampaign[] }> {
    try {
      const response = await this.request('/api/leads/campaigns')
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching lead campaigns:', error)
      return { success: false, data: [] }
    }
  }

  async getLeadDashboardStats(): Promise<DashboardStatsEnhanced> {
    try {
      const response = await this.request('/api/leads/dashboard-stats')
      return response.data || { total_jobs: 0, total_contacts: 0, total_campaigns: 0, active_agents: 0 }
    } catch (error) {
      console.error('Error fetching lead dashboard stats:', error)
      return { total_jobs: 0, total_contacts: 0, total_campaigns: 0, active_agents: 0 }
    }
  }

  // Job Search
  async searchJobs(request: JobSearchRequest): Promise<JobSearchResponse> {
    try {
      const response = await this.request('/api/search-jobs', {
        method: 'POST',
        body: JSON.stringify(request)
      })

      return response
    } catch (error) {
      console.error('Error searching jobs:', error)
      throw error
    }
  }

  // Memory and Analytics
  async getMemoryStats() {
    try {
      return await this.request('/memory-stats')
    } catch (error) {
      console.error('Error fetching memory stats:', error)
      return null
    }
  }

  async clearMemory() {
    try {
      return await this.request('/memory', { method: 'DELETE' })
    } catch (error) {
      console.error('Error clearing memory:', error)
      throw error
    }
  }

  // Health Check
  async checkHealth() {
    try {
      return await this.request('/')
    } catch (error) {
      console.error('Error checking health:', error)
      return { status: 'unhealthy' }
    }
  }

  // Real-time Agent Monitoring (from HTML templates)
  async getAgentLogs(batchId: string): Promise<AgentLog[]> {
    try {
      const response = await this.request(`/api/logs/${batchId}`)
      return response.logs || []
    } catch (error) {
      console.error(`Error fetching logs for ${batchId}:`, error)
      return []
    }
  }

  async getAgentStatus(batchId: string): Promise<AgentStatus> {
    try {
      const response = await this.request(`/api/status/${batchId}`)
      return response
    } catch (error) {
      console.error(`Error fetching status for ${batchId}:`, error)
      return { status: 'failed', message: 'Status unavailable' }
    }
  }

  async cancelAgent(batchId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request(`/api/cancel-search/${batchId}`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error(`Error cancelling agent ${batchId}:`, error)
      throw error
    }
  }

  async pauseAgent(batchId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request(`/api/pause-agent/${batchId}`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error(`Error pausing agent ${batchId}:`, error)
      throw error
    }
  }

  async resumeAgent(batchId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request(`/api/resume-agent/${batchId}`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error(`Error resuming agent ${batchId}:`, error)
      throw error
    }
  }

  // Agent Templates (from HTML dashboard)
  async getAgentTemplates(): Promise<AgentTemplate[]> {
    try {
      return await this.request('/api/agent-templates')
    } catch (error) {
      console.error('Error fetching agent templates:', error)
      return []
    }
  }

  async saveAgentTemplate(template: Omit<AgentTemplate, 'id' | 'created_at'>): Promise<AgentTemplate> {
    try {
      return await this.request('/api/agent-templates', {
        method: 'POST',
        body: JSON.stringify(template)
      })
    } catch (error) {
      console.error('Error saving agent template:', error)
      throw error
    }
  }

  // Campaign Integration (from HTML templates)
  async sendToInstantly(leadIds: string[], campaignName: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request('/api/instantly/send', {
        method: 'POST',
        body: JSON.stringify({
          lead_ids: leadIds,
          campaign_name: campaignName
        })
      })
      return response
    } catch (error) {
      console.error('Error sending to Instantly:', error)
      throw error
    }
  }

  // System Analytics (from HTML dashboard)
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      return await this.request('/api/system/health')
    } catch (error) {
      console.error('Error fetching system health:', error)
      return {
        status: 'unknown',
        uptime: 0,
        memory_usage: 0,
        cpu_usage: 0,
        active_connections: 0
      }
    }
  }

  // ClearOut Email Verification
  async verifyEmail(email: string) {
    try {
      return await this.request('/api/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
    } catch (error) {
      console.error('Error verifying email:', error)
      throw error
    }
  }

  async verifyEmailsBulk(emails: string[]) {
    try {
      return await this.request('/api/verify-emails-bulk', {
        method: 'POST',
        body: JSON.stringify({ emails })
      })
    } catch (error) {
      console.error('Error in bulk email verification:', error)
      throw error
    }
  }

  async getVerificationStatus(jobId: string) {
    try {
      return await this.request(`/api/verification-status/${jobId}`)
    } catch (error) {
      console.error('Error getting verification status:', error)
      throw error
    }
  }

  async getClearoutAccount() {
    try {
      return await this.request('/api/clearout-account')
    } catch (error) {
      console.error('Error getting ClearOut account info:', error)
      throw error
    }
  }

  async findCompanyDomain(companyName: string) {
    try {
      return await this.request('/api/find-company-domain', {
        method: 'POST',
        body: JSON.stringify({ company_name: companyName })
      })
    } catch (error) {
      console.error('Error finding company domain:', error)
      throw error
    }
  }

  // Progressive Agent Methods
  async createProgressiveAgent(
    query: string, 
    hoursOld: number = 24, 
    customTags?: string,
    targetType: string = 'hiring_managers',
    companySize: string = 'all',
    locationFilter?: string
  ): Promise<ProgressiveAgentResponse> {
    console.log('🚀 Creating progressive agent for instant LinkedIn results...')
    
    const response = await this.request('/api/agents/create-progressive', {
      method: 'POST',
      body: JSON.stringify({
        query,
        hours_old: hoursOld,
        enforce_salary: true,
        auto_generate_messages: true,
        create_campaigns: true,
        custom_tags: customTags ? [customTags] : undefined,
        target_type: targetType,
        company_size: companySize,
        location_filter: locationFilter
      })
    })

    console.log('✅ Progressive agent created:', response.agent.id)
    return response
  }

  async getProgressiveAgent(agentId: string): Promise<ProgressiveAgentResponse> {
    return await this.request(`/api/agents/progressive/${agentId}`)
  }

  async getAllProgressiveAgents(): Promise<ProgressiveAgent[]> {
    return await this.request('/api/agents/progressive')
  }

  // Progressive Agent Data Methods
  async getProgressiveJobs(limit: number = 100): Promise<{ success: boolean; data: ProgressiveJob[] }> {
    try {
      // Get both LinkedIn and other jobs separately
      const [linkedinResponse, otherResponse] = await Promise.all([
        this.request(`/api/leads/linkedin-jobs?limit=${Math.floor(limit / 2)}`),
        this.request(`/api/leads/other-jobs?limit=${Math.floor(limit / 2)}`)
      ])
      
      // Combine both types of jobs
      const allJobs = [
        ...(linkedinResponse.data || []),
        ...(otherResponse.data || [])
      ]
      
      return { success: true, data: allJobs }
    } catch (error) {
      console.error('Error fetching progressive jobs:', error)
      return { success: false, data: [] }
    }
  }

  async getProgressiveContacts(limit: number = 100): Promise<{ success: boolean; data: ProgressiveContact[] }> {
    try {
      const response = await this.request(`/api/leads/progressive-contacts?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching progressive contacts:', error)
      return { success: false, data: [] }
    }
  }

  // Separate methods for LinkedIn vs Other jobs
  async getLinkedInJobs(limit: number = 100): Promise<{ success: boolean; data: ProgressiveJob[] }> {
    try {
      const response = await this.request(`/api/leads/linkedin-jobs?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching LinkedIn jobs:', error)
      return { success: false, data: [] }
    }
  }

  async getOtherJobs(limit: number = 100): Promise<{ success: boolean; data: ProgressiveJob[] }> {
    try {
      const response = await this.request(`/api/leads/other-jobs?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching other jobs:', error)
      return { success: false, data: [] }
    }
  }

  async getProgressiveCampaigns(limit: number = 100): Promise<{ success: boolean; data: ProgressiveCampaign[] }> {
    try {
      const response = await this.request(`/api/leads/campaigns?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching progressive campaigns:', error)
      return { success: false, data: [] }
    }
  }

  async getDashboardStatsEnhanced(): Promise<{ success: boolean; data: DashboardStatsEnhanced }> {
    try {
      const response = await this.request('/api/leads/dashboard-stats')
      return { success: true, data: response.data || { total_jobs: 0, total_contacts: 0, total_campaigns: 0, active_agents: 0 } }
    } catch (error) {
      console.error('Error fetching enhanced dashboard stats:', error)
      return { success: false, data: { total_jobs: 0, total_contacts: 0, total_campaigns: 0, active_agents: 0 } }
    }
  }

  async getAgentJobs(agentId: string, limit: number = 100): Promise<{ success: boolean; data: ProgressiveJob[]; count: number }> {
    return this.request(`/api/leads/agent/${agentId}/jobs?limit=${limit}`)
  }

  async getAgentContacts(agentId: string, limit: number = 100): Promise<{ success: boolean; data: ProgressiveContact[]; count: number }> {
    return this.request(`/api/leads/agent/${agentId}/contacts?limit=${limit}`)
  }

  async getAgentCampaigns(agentId: string, limit: number = 100): Promise<{ success: boolean; data: ProgressiveCampaign[]; count: number }> {
    return this.request(`/api/leads/agent/${agentId}/campaigns?limit=${limit}`)
  }

  // Enhanced polling helper with WebSocket fallback and error resilience
  async pollProgressiveAgent(
    agentId: string, 
    onUpdate: (agent: ProgressiveAgent) => void, 
    onComplete: (agent: ProgressiveAgent) => void,
    onError?: (error: string) => void
  ) {
    let isActive = true
    let retryCount = 0
    const maxRetries = 5
    const baseDelay = 5000 // 5 seconds base delay
    
    const poll = async () => {
      if (!isActive) return
      
      try {
        const response = await this.getProgressiveAgent(agentId)
        const agent = response.agent
        
        // Reset retry count on successful response
        retryCount = 0
        
        onUpdate(agent)
        
        if (agent.status === 'completed' || agent.status === 'failed') {
          onComplete(agent)
          isActive = false
          return
        }
        
        // Use adaptive polling intervals based on stage
        let pollInterval = response.next_update_in_seconds * 1000
        
        // More frequent polling for LinkedIn stage (fast results)
        if (agent.status === 'linkedin_stage') {
          pollInterval = Math.min(pollInterval, 3000) // 3 seconds max for LinkedIn
        } else if (agent.status === 'enrichment_stage') {
          pollInterval = Math.min(pollInterval, 10000) // 10 seconds max for enrichment
        }
        
        setTimeout(poll, pollInterval)
        
      } catch (error) {
        console.error('Error polling progressive agent:', error)
        retryCount++
        
        if (retryCount >= maxRetries) {
          const errorMsg = `Failed to poll agent ${agentId} after ${maxRetries} attempts`
          console.error(errorMsg)
          onError?.(errorMsg)
          isActive = false
          return
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, retryCount - 1) + Math.random() * 1000
        setTimeout(poll, delay)
      }
    }
    
    // Start polling
    poll()
    
    // Return cleanup function
    return () => {
      isActive = false
    }
  }

  // WebSocket connection for real-time updates (when available)
  connectProgressiveUpdates(
    agentId: string,
    onUpdate: (agent: ProgressiveAgent) => void,
    onComplete: (agent: ProgressiveAgent) => void,
    onError?: (error: string) => void
  ) {
    // Try WebSocket first, fallback to polling
    try {
      const wsUrl = this.baseUrl.replace('http', 'ws') + `/ws/agents/${agentId}`
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log(`🔌 WebSocket connected for agent ${agentId}`)
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const agent = data.agent as ProgressiveAgent
          
          onUpdate(agent)
          
          if (agent.status === 'completed' || agent.status === 'failed') {
            onComplete(agent)
            ws.close()
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onerror = (error) => {
        console.warn('WebSocket error, falling back to polling:', error)
        ws.close()
        // Fallback to polling
        this.pollProgressiveAgent(agentId, onUpdate, onComplete, onError)
      }
      
      ws.onclose = () => {
        console.log(`🔌 WebSocket disconnected for agent ${agentId}`)
      }
      
      return ws
    } catch (error) {
      console.warn('WebSocket not available, using polling:', error)
      this.pollProgressiveAgent(agentId, onUpdate, onComplete, onError)
      return null
    }
  }
}

export const apiClient = new ApiClient()
