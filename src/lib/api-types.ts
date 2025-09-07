// API Types and Interfaces for COOGI Platform
// Extracted from api-production.ts for better maintainability

export interface Agent {
  id: string
  query: string
  status: 'running' | 'paused' | 'completed' | 'failed' | 'processing' | 'initializing' | 'enrichment_stage'
  created_at: string
  updated_at: string
  total_jobs_found: number
  total_emails_found: number
  hours_old?: number
  custom_tags?: string | string[] // Support both for backward compatibility
  batch_id?: string
  processed_cities?: number
  processed_companies?: number
  start_time?: string
  end_time?: string
  total_progress?: number
  staged_results?: {
    linkedin_jobs?: any[]
    other_jobs?: any[]
    verified_contacts?: any[]
    campaigns?: any[]
    total_jobs?: number
    total_contacts?: number
    total_campaigns?: number
  }
  stages?: Record<string, {
    name: string
    status: string
    progress: number
    results_count?: number
    started_at?: string
    completed_at?: string
    error_message?: string
  }>
  target_type?: string
  company_size?: string
  location_filter?: string
  final_stats?: {
    total_jobs: number
    total_contacts: number
    total_campaigns: number
    completion_time: string
  }
}

export interface DashboardStats {
  activeAgents: number
  totalRuns: number
  totalJobs: number
  totalContacts: number // Add contacts count
  successRate: number
}

// SES interfaces
export interface SESEmailRequest {
  to_emails: string[]
  subject: string
  body_html: string
  body_text: string
  from_email: string
  reply_to?: string
}

export interface SESBulkEmailRequest {
  emails_data: Array<{
    email: string
    template_data: Record<string, any>
  }>
  template_name: string
  from_email: string
  reply_to?: string
}

export interface SESTemplateRequest {
  template_name: string
  subject: string
  html_part: string
  text_part: string
}

export interface SESCampaignRequest {
  query: string
  campaign_name: string
  max_leads: number
  min_score?: number
  from_email: string
  subject: string
  email_template: string
  send_immediately?: boolean
}

export interface SESStats {
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

export interface SESCampaignResponse {
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

export interface Campaign {
  // Core Campaign Fields
  id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'ready'
  platform: 'aws_ses' | 'instantly' | 'internal'
  
  // Provider Integration
  provider_campaign_id?: string // External ID from AWS SES/Instantly
  
  // Email Content (Required for production campaigns)
  subject_line: string
  from_email: string
  from_name: string
  
  // Email Sequence
  email_sequence: EmailStep[]
  
  // Contacts & Targeting
  target_count: number
  verified_contacts: Contact[]
  
  // Live Metrics (synced from provider)
  sent_count: number
  open_count: number
  reply_count: number
  click_count: number
  bounce_count: number
  
  // Calculated Rates
  open_rate: number
  reply_rate: number
  click_rate: number
  
  // Metadata
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
  agent_id?: string
  batch_id?: string
  
  // Error Handling
  last_sync_at?: string
  sync_errors?: string[]
}

export interface EmailStep {
  step_number: number
  subject: string
  body: string
  delay_days: number
  template_variables?: Record<string, string>
}

export interface Contact {
  id?: string
  email: string
  first_name: string
  last_name: string
  company: string
  title: string
  linkedin_url?: string
  phone?: string
  verified: boolean
  verification_status?: 'valid' | 'invalid' | 'risky' | 'unknown'
  source: string
  confidence_score?: number
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

export interface SimpleContact {
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
  top_contacts: SimpleContact[]
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
  target_type: string
  company_size?: string
  location_filter?: string
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

// Company size mappings
export interface CompanySizeRange {
  min: number
  max: number | null // null represents infinity
}

export const COMPANY_SIZE_MAPPINGS: Record<string, CompanySizeRange[]> = {
  'small': [{ min: 1, max: 99 }],     // 1-99 employees
  'medium': [{ min: 100, max: 999 }], // 100-999 employees  
  'large': [{ min: 1000, max: null }], // 1000+ employees
  'all': [
    { min: 1, max: 99 },
    { min: 100, max: 999 },
    { min: 1000, max: null }
  ]
}

export function getCompanySizeRanges(sizeLabels: string | string[]): CompanySizeRange[] {
  if (!sizeLabels || sizeLabels === 'all') {
    return COMPANY_SIZE_MAPPINGS.all
  }
  
  const labels = Array.isArray(sizeLabels) ? sizeLabels : [sizeLabels]
  const ranges: CompanySizeRange[] = []
  
  labels.forEach(label => {
    const normalizedLabel = label.toLowerCase().trim()
    if (COMPANY_SIZE_MAPPINGS[normalizedLabel]) {
      ranges.push(...COMPANY_SIZE_MAPPINGS[normalizedLabel])
    }
  })
  
  return ranges.length > 0 ? ranges : COMPANY_SIZE_MAPPINGS.all
}

// Campaign Creation & Management
export interface CreateCampaignRequest {
  name: string
  platform: 'aws_ses' | 'instantly'
  subject_line: string
  from_email: string
  from_name: string
  email_sequence: EmailStep[]
  contacts: Contact[]
  agent_id?: string
}

export interface CampaignStatsResponse {
  campaign_id: string
  sent: number
  opens: number
  replies: number
  clicks: number
  bounces: number
  open_rate: number
  reply_rate: number
  click_rate: number
  last_updated: string
}

export interface CampaignOperationResponse {
  success: boolean
  message: string
  campaign_id: string
  provider_campaign_id?: string
}

export interface ContactVerificationResult {
  email: string
  status: 'valid' | 'invalid' | 'risky' | 'unknown'
  score?: number
  reason?: string
}
