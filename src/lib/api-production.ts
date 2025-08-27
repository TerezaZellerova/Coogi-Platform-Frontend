// Production API client for COOGI platform
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://coogi-backend.onrender.com'

export interface Agent {
  id: string
  query: string
  status: 'running' | 'paused' | 'completed' | 'failed' | 'processing'
  created_at: string
  total_jobs_found: number
  total_emails_found: number
  hours_old?: number
  custom_tags?: string
  batch_id?: string
  processed_cities?: number
  processed_companies?: number
  start_time?: string
  end_time?: string
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
  job_source: string  // This is the key field for showing job sources!
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
  custom_tags?: string
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
    
    // Add timeout for long-running requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1200000) // 20 minute timeout for real data processing
    
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
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store',
        body: JSON.stringify({ email, password })
      })

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
      
      return authData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async signup(email: string, password: string) {
    // For now, signup is the same as login since we only have test users
    return this.login(email, password)
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
    try {
      return await this.request('/api/dashboard/stats')
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        activeAgents: 0,
        totalRuns: 0,
        totalJobs: 0,
        successRate: 0
      }
    }
  }

  // Agent Management
  async getAgents(): Promise<Agent[]> {
    try {
      return await this.request('/api/agents')
    } catch (error) {
      console.error('Error fetching agents:', error)
      return []
    }
  }

  async createAgent(query: string, hoursOld: number = 24, customTags?: string): Promise<{ agent: Agent, results: JobSearchResults }> {
    try {
      const response = await this.request('/api/search-jobs', {
        method: 'POST',
        body: JSON.stringify({
          query,
          hours_old: hoursOld,
          custom_tags: customTags ? [customTags] : undefined
        })
      })

      const newAgent: Agent = {
        id: `agent_${Date.now()}`,
        query,
        status: 'completed',
        created_at: new Date().toISOString(),
        total_jobs_found: response.jobs_found || 0,
        total_emails_found: response.leads_added || 0,
        hours_old: hoursOld,
        custom_tags: customTags,
        batch_id: `agent_${Date.now()}`
      }

      const results: JobSearchResults = {
        companies_analyzed: response.companies_analyzed || [],
        jobs_found: response.jobs_found || 0,
        total_processed: response.total_processed || 0,
        search_query: response.search_query || query,
        timestamp: response.timestamp || new Date().toISOString(),
        campaigns_created: response.campaigns_created,
        leads_added: response.leads_added
      }

      return { agent: newAgent, results }
    } catch (error) {
      console.error('Error creating agent:', error)
      throw error
    }
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
      return await this.request('/api/campaigns')
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
}

export const apiClient = new ApiClient()
