// ClearOut API service for email verification
// Types and interfaces are exported, methods are available through apiClient

export interface EmailVerificationResult {
  email: string
  status: string
  result: string
  reason: string
  confidence: number
  is_valid: boolean
  is_deliverable: boolean
  domain_valid: boolean
  mx_found: boolean
  smtp_valid: boolean
}

export interface BulkVerificationResult {
  job_id: string
  status: string
  total_emails: number
  estimated_time: string
}

export interface VerificationStatusResult {
  job_id: string
  status: string
  progress: number
  results: EmailVerificationResult[]
  completed: boolean
}

export interface AccountInfo {
  account_id: string
  email: string
  credits_remaining: number
  plan: string
  status: string
}

export interface CompanyDomainResult {
  company_name: string
  domain: string | null
  found: boolean
}

// Use apiClient.verifyEmail(), apiClient.verifyEmailsBulk(), etc.
// Import { apiClient } from './api-production' to use these methods
