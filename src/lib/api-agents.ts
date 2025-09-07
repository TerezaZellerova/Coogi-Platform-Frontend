// Progressive Agent API Methods
// Specialized methods for handling progressive agents and real-time updates

import type {
  ProgressiveAgent,
  ProgressiveAgentResponse,
  ProgressiveJob,
  ProgressiveContact,
  ProgressiveCampaign,
  DashboardStatsEnhanced,
  Agent
} from './api-types'

export class ProgressiveAgentAPI {
  constructor(private baseUrl: string, private request: (endpoint: string, options?: RequestInit) => Promise<any>) {}

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
    
    // Root cause fix: Send company_size as string (backend expects this), not company_size_ranges
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
        company_size: companySize, // Send string directly as backend expects
        location_filter: locationFilter
      })
    })

    console.log('✅ Progressive agent created:', response.agent.id)
    return response
  }

  async getProgressiveAgent(agentId: string): Promise<ProgressiveAgentResponse> {
    return await this.request(`/api/agents/progressive/${agentId}`)
  }

  async getAllProgressiveAgents(): Promise<Agent[]> {
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

  // Progressive Agent Data Methods (OPTIMIZED FOR HUNTER.IO QUOTA)
  async getProgressiveJobs(limit: number = 50): Promise<{ success: boolean; data: ProgressiveJob[] }> {
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

  async getProgressiveContacts(limit: number = 50): Promise<{ success: boolean; data: ProgressiveContact[] }> {
    try {
      const response = await this.request(`/api/leads/progressive-contacts?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching progressive contacts:', error)
      return { success: false, data: [] }
    }
  }

  // Separate methods for LinkedIn vs Other jobs (OPTIMIZED)
  async getLinkedInJobs(limit: number = 50): Promise<{ success: boolean; data: ProgressiveJob[] }> {
    try {
      const response = await this.request(`/api/leads/linkedin-jobs?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching LinkedIn jobs:', error)
      return { success: false, data: [] }
    }
  }

  async getOtherJobs(limit: number = 50): Promise<{ success: boolean; data: ProgressiveJob[] }> {
    try {
      const response = await this.request(`/api/leads/other-jobs?limit=${limit}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching other jobs:', error)
      return { success: false, data: [] }
    }
  }

  async getProgressiveCampaigns(limit: number = 50): Promise<{ success: boolean; data: ProgressiveCampaign[] }> {
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

  // Hunter.io Quota Management (NEW)
  async getHunterQuotaStatus(): Promise<{ success: boolean; quota_status?: any; recommendations?: string[] }> {
    try {
      return await this.request('/api/hunter/quota-status')
    } catch (error) {
      console.error('Error fetching Hunter.io quota status:', error)
      return { success: false }
    }
  }

  async getOptimizedLimits(): Promise<{ success: boolean; optimized_limits?: any; recommendation?: string }> {
    try {
      return await this.request('/api/hunter/optimized-limits')
    } catch (error) {
      console.error('Error fetching optimized limits:', error)
      return { success: false }
    }
  }

  async resetHunterQuota(): Promise<{ success: boolean; message?: string }> {
    try {
      return await this.request('/api/hunter/reset-quota', { method: 'POST' })
    } catch (error) {
      console.error('Error resetting Hunter.io quota:', error)
      return { success: false }
    }
  }
}
