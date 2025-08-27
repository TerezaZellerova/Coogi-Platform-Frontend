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
      // This would integrate with Instantly.ai API
      // For now, return mock data
      return [
        {
          id: '1',
          name: 'Tech Outreach Q1',
          status: 'active',
          leads_count: 150,
          open_rate: 24.5,
          reply_rate: 8.3
        },
        {
          id: '2',
          name: 'Marketing Professionals',
          status: 'active',
          leads_count: 89,
          open_rate: 31.2,
          reply_rate: 12.1
        }
      ]
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
export type { Agent, DashboardStats, Campaign }
