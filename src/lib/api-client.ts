// Core API Client for COOGI Platform
// Main client class with authentication, basic CRUD operations, and utilities

import { ProgressiveAgentAPI } from './api-agents'
import type {
  Agent,
  DashboardStats,
  Campaign,
  Lead,
  Contact,
  EmailStep,
  CreateCampaignRequest,
  CampaignStatsResponse,
  CampaignOperationResponse,
  ContactVerificationResult,
  JobSearchRequest,
  JobSearchResponse,
  JobSearchResults,
  AgentLog,
  AgentStatus,
  AgentTemplate,
  SystemHealth,
  SESEmailRequest,
  SESBulkEmailRequest,
  SESTemplateRequest,
  SESCampaignRequest,
  SESStats,
  SESCampaignResponse,
  ProgressiveJob,
  ProgressiveContact,
  DashboardStatsEnhanced
} from './api-types'

// Production API client for COOGI platform
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001'

class ApiClient {
  private baseUrl: string
  public progressiveAgents: ProgressiveAgentAPI

  constructor() {
    this.baseUrl = API_BASE
    this.progressiveAgents = new ProgressiveAgentAPI(this.baseUrl, this.request.bind(this))
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return {
        'Content-Type': 'application/json'
      }
    }
    
    // Development mode - use test token
    if (process.env.NODE_ENV === 'development') {
      return {
        'Authorization': 'Bearer test_token_test_coogi_dev',
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
      totalContacts: response.data.total_contacts || 0, // Add contacts from backend
      successRate: 100 // Default success rate, can be calculated later
    }
  }

  // Agent Management
  async getAgents(): Promise<Agent[]> {
    try {
      const response = await this.request('/api/agents/progressive')
      
      // Transform the progressive agent data to match our interface
      return response.map((agent: any) => ({
        id: agent.id,
        query: agent.query,
        status: agent.status,
        created_at: agent.created_at,
        updated_at: agent.updated_at,
        total_jobs_found: agent.staged_results?.total_jobs || 0,
        total_emails_found: agent.staged_results?.total_contacts || 0,
        hours_old: agent.hours_old,
        custom_tags: agent.custom_tags,
        batch_id: agent.id,
        total_progress: agent.total_progress,
        staged_results: agent.staged_results,
        stages: agent.stages,
        target_type: agent.target_type,
        company_size: agent.company_size,
        location_filter: agent.location_filter,
        final_stats: agent.final_stats
      }))
    } catch (error) {
      console.error('Error fetching progressive agents:', error)
      // Fallback to empty array if progressive agents endpoint fails
      return []
    }
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
      updated_at: new Date().toISOString(),
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
  }  // ===================================
  // 🚀 PRODUCTION CAMPAIGN MANAGEMENT
  // ===================================

  // 1. Create Production Campaign
  async createProductionCampaign(request: CreateCampaignRequest): Promise<CampaignOperationResponse> {
    console.log('🚀 Creating production campaign:', request.name)
    
    try {
      // Validate required fields
      if (!request.subject_line || !request.email_sequence.length) {
        throw new Error('Subject line and email sequence are required')
      }

      const response = await this.request('/api/production-campaigns/create', {
        method: 'POST',
        body: JSON.stringify({
          ...request,
          verified_contacts: await this.verifyContacts(request.contacts)
        })
      })

      console.log('✅ Campaign created:', response.campaign_id)
      return response
    } catch (error) {
      console.error('❌ Error creating production campaign:', error)
      throw error
    }
  }

  // 2. Get All Campaigns (Unified from all providers)
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await this.request('/api/campaigns')
      return response.campaigns || []
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }
  }

  // 3. Start Campaign (Push to Provider & Activate)
  async startCampaign(campaignId: string): Promise<CampaignOperationResponse> {
    try {
      return await this.request(`/api/production-campaigns/${campaignId}/start`, {
        method: 'POST'
      })
    } catch (error) {
      console.error(`Error starting campaign ${campaignId}:`, error)
      throw error
    }
  }

  // 4. Pause Campaign
  async pauseCampaign(campaignId: string): Promise<CampaignOperationResponse> {
    try {
      return await this.request(`/api/production-campaigns/${campaignId}/pause`, {
        method: 'POST'
      })
    } catch (error) {
      console.error(`Error pausing campaign ${campaignId}:`, error)
      throw error
    }
  }

  // 5. Resume Campaign
  async resumeCampaign(campaignId: string): Promise<CampaignOperationResponse> {
    try {
      return await this.request(`/api/production-campaigns/${campaignId}/resume`, {
        method: 'POST'
      })
    } catch (error) {
      console.error(`Error resuming campaign ${campaignId}:`, error)
      throw error
    }
  }

  // 6. Get Live Campaign Stats
  async getCampaignStats(campaignId: string): Promise<CampaignStatsResponse> {
    try {
      return await this.request(`/api/production-campaigns/${campaignId}/stats`)
    } catch (error) {
      console.error(`Error fetching stats for campaign ${campaignId}:`, error)
      throw error
    }
  }

  // 7. Sync Campaign Stats (Manual refresh)
  async syncCampaignStats(campaignId: string): Promise<CampaignOperationResponse> {
    try {
      return await this.request(`/api/production-campaigns/${campaignId}/sync`, {
        method: 'POST'
      })
    } catch (error) {
      console.error(`Error syncing stats for campaign ${campaignId}:`, error)
      throw error
    }
  }

  // 8. Verify Contacts Before Campaign Creation
  async verifyContacts(contacts: Contact[]): Promise<Contact[]> {
    try {
      const emails = contacts.map(c => c.email)
      const verificationResponse = await this.request('/api/contacts/verify-bulk', {
        method: 'POST',
        body: JSON.stringify({ emails })
      })

      // Map verification results back to contacts
      const verificationMap = new Map(
        verificationResponse.results.map((r: ContactVerificationResult) => [r.email, r])
      )

      return contacts.map(contact => {
        const verification = verificationMap.get(contact.email) as ContactVerificationResult | undefined
        return {
          ...contact,
          verified: verification?.status === 'valid',
          verification_status: verification?.status || 'unknown'
        }
      }).filter(contact => contact.verified) // Only return valid contacts
    } catch (error) {
      console.error('Error verifying contacts:', error)
      // Return original contacts if verification fails
      return contacts.map(contact => ({ ...contact, verified: false, verification_status: 'unknown' as const }))
    }
  }

  // 9. Update Campaign
  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<CampaignOperationResponse> {
    try {
      return await this.request(`/api/production-campaigns/${campaignId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
    } catch (error) {
      console.error(`Error updating campaign ${campaignId}:`, error)
      throw error
    }
  }

  // 10. Delete Campaign
  async deleteCampaign(campaignId: string): Promise<CampaignOperationResponse> {
    try {
      return await this.request(`/api/production-campaigns/${campaignId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error(`Error deleting campaign ${campaignId}:`, error)
      throw error
    }
  }

  // Legacy methods for backward compatibility (simplified)
  async createCampaign(name: string, leadIds: string[]): Promise<Campaign> {
    const request: CreateCampaignRequest = {
      name,
      platform: 'instantly',
      subject_line: `Opportunities at ${name}`,
      from_email: 'noreply@coogi.ai',
      from_name: 'Coogi Team',
      email_sequence: [{
        step_number: 1,
        subject: `Opportunities at ${name}`,
        body: 'Hi {{first_name}},\n\nI hope this message finds you well...',
        delay_days: 0
      }],
      contacts: leadIds.map(id => ({
        id,
        email: `contact${id}@example.com`,
        first_name: 'Contact',
        last_name: 'Lead',
        company: 'Company',
        title: 'Professional',
        verified: false,
        source: 'legacy'
      }))
    }

    const result = await this.createProductionCampaign(request)
    
    // Return simplified Campaign for backward compatibility
    return {
      id: result.campaign_id,
      name,
      status: 'draft',
      platform: 'instantly',
      subject_line: request.subject_line,
      from_email: request.from_email,
      from_name: request.from_name,
      email_sequence: request.email_sequence,
      target_count: 0,
      verified_contacts: [],
      sent_count: 0,
      open_count: 0,
      reply_count: 0,
      click_count: 0,
      bounce_count: 0,
      open_rate: 0,
      reply_rate: 0,
      click_rate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // ===================================
  // 📊 LEAD MANAGEMENT
  // ===================================

  async getLeads(): Promise<Lead[]> {
    try {
      return await this.request('/api/leads')
    } catch (error) {
      console.error('Error fetching leads:', error)
      return []
    }
  }

  // Lead Data Management - Real backend data for dashboard (OPTIMIZED FOR HUNTER.IO QUOTA)
  async getLeadJobs(limit: number = 50): Promise<{ success: boolean; data: ProgressiveJob[] }> {
    try {
      const response = await this.request(`/api/leads/jobs?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching lead jobs:', error)
      return { success: false, data: [] }
    }
  }

  async getLeadContacts(limit: number = 50): Promise<{ success: boolean; data: ProgressiveContact[] }> {
    try {
      const response = await this.request(`/api/leads/contacts?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching lead contacts:', error)
      return { success: false, data: [] }
    }
  }

  async getLeadCampaigns(): Promise<{ success: boolean; data: any[] }> {
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

  // Campaign Integration - Instantly.ai (Primary)
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

  // Progressive Agent Methods (delegated to specialized class)
  async createProgressiveAgent(
    query: string, 
    hoursOld: number = 24, 
    customTags?: string,
    targetType: string = 'hiring_managers',
    companySize: string = 'all',
    locationFilter?: string
  ) {
    return this.progressiveAgents.createProgressiveAgent(query, hoursOld, customTags, targetType, companySize, locationFilter)
  }

  async getProgressiveAgent(agentId: string) {
    return this.progressiveAgents.getProgressiveAgent(agentId)
  }

  async getAllProgressiveAgents() {
    return this.progressiveAgents.getAllProgressiveAgents()
  }

  async pollProgressiveAgent(agentId: string, onUpdate: any, onComplete: any, onError?: any) {
    return this.progressiveAgents.pollProgressiveAgent(agentId, onUpdate, onComplete, onError)
  }

  connectProgressiveUpdates(agentId: string, onUpdate: any, onComplete: any, onError?: any) {
    return this.progressiveAgents.connectProgressiveUpdates(agentId, onUpdate, onComplete, onError)
  }

  // SES API methods
  async sendSESEmail(request: SESEmailRequest): Promise<{ message: string; message_id: string }> {
    try {
      return await this.request('/api/ses/send-email', {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      console.error('Error sending SES email:', error)
      throw error
    }
  }

  async sendSESBulkEmail(request: SESBulkEmailRequest): Promise<{ message: string; sent_count: number; failed_count: number }> {
    try {
      return await this.request('/api/ses/send-bulk-email', {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      console.error('Error sending SES bulk email:', error)
      throw error
    }
  }

  async createSESTemplate(request: SESTemplateRequest): Promise<{ message: string; template_name: string }> {
    try {
      return await this.request('/api/ses/create-template', {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      console.error('Error creating SES template:', error)
      throw error
    }
  }

  async getSESStats(): Promise<SESStats> {
    try {
      return await this.request('/api/providers/ses/stats')
    } catch (error) {
      console.error('Error fetching SES stats:', error)
      throw error
    }
  }

  async createSESCampaign(request: SESCampaignRequest): Promise<SESCampaignResponse> {
    try {
      return await this.request('/api/ses/create-campaign', {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      console.error('Error creating SES campaign:', error)
      throw error
    }
  }

  // Candidate Search (Apollo.io Integration)
  async searchCandidates(searchParams: {
    job_title: string
    location?: string
    domain?: string
    company_size?: string
    limit?: number
  }): Promise<{
    success: boolean
    candidates: Array<{
      name: string
      first_name: string
      last_name: string
      email: string
      title: string
      company: string
      domain: string
      location: string
      linkedin_url: string
      phone: string
      seniority: string
      departments: string[]
      functions: string[]
      email_status: string
      apollo_id: string
      source: string
    }>
    total_found: number
    search_params: any
    timestamp: string
    error?: string
  }> {
    try {
      return await this.request('/api/candidates/search', {
        method: 'POST',
        body: JSON.stringify(searchParams)
      })
    } catch (error) {
      console.error('Error searching candidates:', error)
      throw error
    }
  }

  async testApolloConnection(): Promise<{
    status: string
    message: string
    details: any
  }> {
    try {
      return await this.request('/api/candidates/test-apollo')
    } catch (error) {
      console.error('Error testing Apollo connection:', error)
      throw error
    }
  }

  async attachCandidateToJob(candidateId: string, jobId: string): Promise<{
    success: boolean
    message: string
    relationship: any
  }> {
    try {
      return await this.request('/api/candidates/attach-to-job', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: candidateId,
          job_id: jobId
        })
      })
    } catch (error) {
      console.error('Error attaching candidate to job:', error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()
export type { ProgressiveAgent, ProgressiveAgentResponse } from './api-types'
