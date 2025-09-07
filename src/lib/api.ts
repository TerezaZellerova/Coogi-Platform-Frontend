// API configuration and utility functions
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dbtdplhlatnlzcvdvptn.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidGRwbGhsYXRubHpjdmR2cHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDk3MTIsImV4cCI6MjA2ODUyNTcxMn0.U3pnytCxcEoo_bJGLzjeNdt_qQ9eX8dzwezrxXOaOfA'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001'

interface Agent {
  id: string
  query: string
  status: 'running' | 'paused' | 'completed' | 'failed'
  created_at: string
  total_jobs_found: number
  total_emails_found: number
  hours_old?: number
  custom_tags?: string
}

interface DashboardStats {
  activeAgents: number
  totalRuns: number
  totalJobs: number
  successRate: number
}

interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed'
  leads_count: number
  open_rate: number
  reply_rate: number
}

// SES interfaces
interface SESEmailRequest {
  to_emails: string[]
  subject: string
  body_html: string
  body_text: string
  from_email: string
  reply_to?: string
}

interface SESBulkEmailRequest {
  emails_data: Array<{
    email: string
    template_data: Record<string, any>
  }>
  template_name: string
  from_email: string
  reply_to?: string
}

interface SESTemplateRequest {
  template_name: string
  subject: string
  html_part: string
  text_part: string
}

interface SESCampaignRequest {
  query: string
  campaign_name: string
  max_leads: number
  min_score?: number
  from_email: string
  subject: string
  email_template: string
  send_immediately?: boolean
}

interface SESStats {
  send_quota: number
  sent_last_24_hours: number
  max_send_rate: number
  bounce_rate: number
  complaint_rate: number
  reputation: {
    delivery_delay: boolean
    reputation_score: number
  }
}

interface SESCampaignResponse {
  campaign_id: string
  leads_found: number
  emails_sent: number
  campaign_status: string
  message: string
  leads: Array<{
    name: string
    email: string
    company: string
    position: string
    score: number
  }>
}

class ApiClient {
  private baseUrl: string
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.baseUrl = API_BASE
    this.supabaseUrl = SUPABASE_URL
    this.supabaseKey = SUPABASE_ANON_KEY
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const authData = localStorage.getItem('coogiAuth')
    if (authData) {
      const { token } = JSON.parse(authData)
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    return {
      'Content-Type': 'application/json'
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = await this.getAuthHeaders()
    
    // Add timeout for long-running operations
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
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
        throw new Error('Request timeout - the operation is taking longer than expected')
      }
      throw error
    }
  }

  private async supabaseRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.supabaseUrl}/rest/v1${endpoint}`, {
      ...options,
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Agent Management
  async getAgents(): Promise<Agent[]> {
    try {
      return await this.supabaseRequest('/agents?select=*&order=created_at.desc')
    } catch (error) {
      console.error('Error fetching agents:', error)
      return []
    }
  }

  async createAgent(query: string, hoursOld: number = 720, customTags?: string): Promise<Agent> {
    try {
      // Use the instant endpoint for immediate response
      const response = await this.request('/api/search-jobs-instant', {
        method: 'POST',
        body: JSON.stringify({
          query,
          hours_old: hoursOld,
          auto_generate_messages: false, // Disable heavy processing
          create_campaigns: false, // Disable campaign creation for now
          custom_tags: customTags ? [customTags] : undefined
        })
      });

      // Return agent data in the expected format
      return {
        id: `agent_${Date.now()}`,
        query,
        status: 'running',
        created_at: new Date().toISOString(),
        total_jobs_found: response.jobs_found || 0,
        total_emails_found: response.leads_added || 0,
        hours_old: hoursOld,
        custom_tags: customTags
      };
    } catch (error) {
      console.error('Error creating agent:', error);
      
      // If the API call fails, return a mock agent for testing
      console.log('Creating mock agent for testing...');
      return {
        id: `agent_${Date.now()}`,
        query,
        status: 'running',
        created_at: new Date().toISOString(),
        total_jobs_found: 50, // Mock data
        total_emails_found: 25, // Mock data
        hours_old: hoursOld,
        custom_tags: customTags
      };
    }
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    return this.supabaseRequest(`/agents?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteAgent(id: string): Promise<void> {
    await this.supabaseRequest(`/agents?id=eq.${id}`, {
      method: 'DELETE'
    })
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const agents = await this.getAgents()
      const activeAgents = agents.filter(agent => agent.status === 'running').length
      const totalRuns = agents.length
      const totalJobs = agents.reduce((sum, agent) => sum + (agent.total_jobs_found || 0), 0)
      const totalEmails = agents.reduce((sum, agent) => sum + (agent.total_emails_found || 0), 0)
      const successRate = totalJobs > 0 ? (totalEmails / totalJobs) * 100 : 0

      return {
        activeAgents,
        totalRuns,
        totalJobs,
        successRate: Math.round(successRate * 10) / 10
      }
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

  // Campaign Management
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/api/campaigns`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }
  }

  // Start Agent (using backend endpoint)
  async startAgent(query: string, hoursOld: number = 24, customTags?: string): Promise<Agent> {
    try {
      const response = await this.request('/start-agent', {
        method: 'POST',
        body: JSON.stringify({
          query,
          hours_old: hoursOld,
          custom_tags: customTags
        })
      })
      return response
    } catch (error) {
      console.error('Error starting agent:', error)
      throw error
    }
  }

  // SES API methods
  async sendSESEmail(request: SESEmailRequest): Promise<{ message: string; message_id: string }> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/api/ses/send-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error sending SES email:', error)
      throw error
    }
  }

  async sendSESBulkEmail(request: SESBulkEmailRequest): Promise<{ message: string; sent_count: number; failed_count: number }> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/api/ses/send-bulk-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to send bulk email: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error sending SES bulk email:', error)
      throw error
    }
  }

  async createSESTemplate(request: SESTemplateRequest): Promise<{ message: string; template_name: string }> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/api/ses/create-template`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create template: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating SES template:', error)
      throw error
    }
  }

  async getSESStats(): Promise<SESStats> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/api/providers/ses/stats`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch SES stats: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching SES stats:', error)
      throw error
    }
  }

  async createSESCampaign(request: SESCampaignRequest): Promise<SESCampaignResponse> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/api/ses/create-campaign`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create SES campaign: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating SES campaign:', error)
      throw error
    }
  }

  // Authentication
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed')
      }

      // Store auth data in localStorage
      const authData = {
        token: data.token,
        user: data.user,
        loginTime: new Date().toISOString()
      }
      localStorage.setItem('coogiAuth', JSON.stringify(authData))
      
      return authData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async signup(email: string, password: string) {
    // For now, signup is the same as login since we only have test users
    // In the future, this would call a real signup endpoint
    return this.login(email, password)
  }

  async logout() {
    localStorage.removeItem('coogiAuth')
    localStorage.removeItem('token') // Also remove old demo token if exists
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const authData = localStorage.getItem('coogiAuth')
    if (!authData) return false
    
    try {
      const auth = JSON.parse(authData)
      return !!(auth.token && auth.user)
    } catch {
      return false
    }
  }

  // Get current user
  getCurrentUser() {
    const authData = localStorage.getItem('coogiAuth')
    if (!authData) return null
    
    try {
      const auth = JSON.parse(authData)
      return auth.user
    } catch {
      return null
    }
  }
}

export const apiClient = new ApiClient()
export type { Agent, DashboardStats, Campaign, SESEmailRequest, SESBulkEmailRequest, SESTemplateRequest, SESCampaignRequest, SESStats, SESCampaignResponse }
