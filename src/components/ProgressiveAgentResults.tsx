'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Briefcase, 
  MapPin, 
  Building, 
  Clock, 
  ExternalLink, 
  User, 
  Mail, 
  Phone, 
  LinkedinIcon,
  Copy,
  CheckCircle,
  Eye,
  Download,
  Filter,
  Search,
  ChevronDown
} from 'lucide-react'
import { ProgressiveAgent } from '@/lib/api-production'

interface ProgressiveAgentResultsProps {
  agent: ProgressiveAgent
  trigger?: React.ReactNode
}

export function ProgressiveAgentResults({ agent, trigger }: ProgressiveAgentResultsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Check if this is a job candidates agent
  const isJobCandidatesAgent = agent.target_type === 'job_candidates'
  
  // Set initial tab based on agent type
  const [activeTab, setActiveTab] = useState(isJobCandidatesAgent ? 'candidates' : 'linkedin')
  const [searchTerm, setSearchTerm] = useState('')

  // CSV Export Functions
  const convertToCSV = (data: any[]) => {
    if (!data.length) return ''
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""')
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')
    
    return csvContent
  }

  const exportToCSV = (data: any[], filename: string) => {
    const csv = convertToCSV(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = (format: 'json' | 'csv') => {
    const timestamp = new Date().toISOString().split('T')[0]
    
    if (isJobCandidatesAgent) {
      // For job candidates, export contacts
      const contacts = agent.staged_results.verified_contacts.map(contact => ({
        name: contact.name,
        email: contact.email,
        title: contact.title,
        company: contact.company,
        location: contact.location,
        linkedin_url: contact.linkedin_url,
        phone: contact.phone,
        verified: contact.verified,
        confidence_score: contact.confidence_score,
        source: contact.source,
        industry: contact.industry,
        company_size: contact.company_size,
        seniority: contact.seniority
      }))
      
      if (format === 'csv') {
        exportToCSV(contacts, `job-candidates-${agent.query}-${timestamp}.csv`)
      } else {
        const data = {
          agent_query: agent.query,
          target_type: agent.target_type,
          candidates: contacts,
          total_candidates: contacts.length,
          exported_at: new Date().toISOString()
        }
        exportToJSON(data, `job-candidates-${agent.query}-${timestamp}.json`)
      }
    } else {
      // For hiring managers, export jobs and contacts
      if (format === 'csv') {
        // Export jobs as CSV
        const allJobs = [...allLinkedInJobs, ...agent.staged_results.other_jobs]
        const jobsForCSV = allJobs.map(job => ({
          title: job.title,
          company: job.company,
          location: job.location,
          salary: formatSalary(job.salary),
          url: job.url,
          description: job.description?.substring(0, 200) + '...',
          posted_date: job.posted_date,
          site: job.site
        }))
        exportToCSV(jobsForCSV, `hiring-manager-jobs-${agent.query}-${timestamp}.csv`)
      } else {
        const data = {
          agent_query: agent.query,
          target_type: agent.target_type,
          linkedin_jobs: allLinkedInJobs,
          other_jobs: agent.staged_results.other_jobs,
          contacts: agent.staged_results.verified_contacts,
          campaigns: agent.staged_results.campaigns,
          total_stats: {
            total_jobs: agent.staged_results.total_jobs,
            total_contacts: agent.staged_results.total_contacts,
            total_campaigns: agent.staged_results.total_campaigns
          },
          exported_at: new Date().toISOString()
        }
        exportToJSON(data, `hiring-manager-results-${agent.query}-${timestamp}.json`)
      }
    }
  }

  const formatSalary = (salary: any) => {
    if (!salary) return 'Not specified'
    if (typeof salary === 'string') return salary
    if (typeof salary === 'object') {
      const { min, max, currency = 'USD', period = 'year' } = salary
      if (min && max) {
        return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / ${period}`
      }
      if (min) return `${currency} ${min.toLocaleString()}+ / ${period}`
      if (max) return `Up to ${currency} ${max.toLocaleString()} / ${period}`
    }
    return 'Not specified'
  }

  const formatPostedDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown'
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return date.toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Process candidate data for job candidates agents
  const candidateContacts = isJobCandidatesAgent 
    ? (agent.staged_results.verified_contacts || []).filter((contact: any) => !contact.is_demo)
    : []

  const filteredCandidates = candidateContacts.filter((candidate: any) =>
    searchTerm === '' || 
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Combine LinkedIn jobs from both arrays and filter out demo data
  const allLinkedInJobs = [
    ...(agent.staged_results.linkedin_jobs || []).filter(job => !job.is_demo),
    ...(agent.staged_results.other_jobs || []).filter(job => 
      (!job.is_demo) && (job.site?.toLowerCase().includes('linkedin') || 
      job.url?.toLowerCase().includes('linkedin.com'))
    )
  ];

  const filteredLinkedInJobs = allLinkedInJobs.filter(job =>
    searchTerm === '' || 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter other jobs to exclude LinkedIn jobs and demo data
  const filteredOtherJobs = (agent.staged_results.other_jobs || []).filter(job => {
    const isLinkedIn = job.site?.toLowerCase().includes('linkedin') || 
                      job.url?.toLowerCase().includes('linkedin.com');
    const isDemoData = job.is_demo;
    const matchesSearch = searchTerm === '' || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return !isLinkedIn && !isDemoData && matchesSearch;
  })

  const JobCard = ({ job, source = 'Unknown' }: { job: any, source?: string }) => (
    <Card key={job.id || Math.random()} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatPostedDate(job.posted_date)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {source}
            </Badge>
            {job.url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(job.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Salary */}
          {job.salary && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                💰 {formatSalary(job.salary)}
              </div>
            </div>
          )}

          {/* Job Description */}
          {job.description && (
            <div className="text-sm text-muted-foreground line-clamp-3">
              {job.description}
            </div>
          )}

          {/* Employment Type & Remote */}
          <div className="flex gap-2">
            {job.employment_type && (
              <Badge variant="secondary" className="text-xs">
                {job.employment_type}
              </Badge>
            )}
            {job.is_remote && (
              <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
                Remote
              </Badge>
            )}
            {job.experience_level && (
              <Badge variant="outline" className="text-xs">
                {job.experience_level}
              </Badge>
            )}
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Skills:</div>
              <div className="flex flex-wrap gap-1">
                {job.skills.slice(0, 8).map((skill: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 8 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{job.skills.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(job.url || '', job.id || Math.random().toString())}
              className="text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedId === (job.id || Math.random().toString()) ? 'Copied!' : 'Copy URL'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(`${job.title} at ${job.company}`, `company-${job.id}`)}
              className="text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedId === `company-${job.id}` ? 'Copied!' : 'Copy Details'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ContactCard = ({ contact }: { contact: any }) => (
    <Card key={contact.id || Math.random()} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="font-medium">{contact.name}</div>
            <div className="text-sm text-muted-foreground">{contact.title}</div>
            <div className="text-sm text-muted-foreground">{contact.company}</div>
            
            <div className="flex gap-2">
              {contact.email && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{contact.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            {contact.linkedin_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(contact.linkedin_url, '_blank')}
              >
                <LinkedinIcon className="h-4 w-4" />
              </Button>
            )}
            {contact.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(contact.email, `email-${contact.id}`)}
              >
                {copiedId === `email-${contact.id}` ? (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const CampaignCard = ({ campaign }: { campaign: any }) => (
    <Card key={campaign.id || Math.random()} className="mb-3">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="font-medium">{campaign.name}</div>
          <div className="text-sm text-muted-foreground">{campaign.description}</div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Status: {campaign.status}</span>
            <span>Leads: {campaign.lead_count || 0}</span>
            <span>Created: {formatPostedDate(campaign.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const CandidateCard = ({ candidate }: { candidate: any }) => (
    <Card key={candidate.id || Math.random()} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg leading-tight">{candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim()}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {candidate.title && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{candidate.title}</span>
                </div>
              )}
              {candidate.company && (
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>{candidate.company}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{candidate.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {candidate.source || 'Candidate'}
            </Badge>
            {candidate.linkedin_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(candidate.linkedin_url, '_blank')}
              >
                <LinkedinIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidate.email && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  {candidate.email}
                </div>
              </div>
            )}
            
            {candidate.phone && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <div className="text-sm text-green-800 dark:text-green-200 mt-1">
                  {candidate.phone}
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="flex gap-2 flex-wrap">
            {candidate.verified && (
              <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {candidate.confidence_score && (
              <Badge variant="outline" className="text-xs">
                {Math.round(candidate.confidence_score * 100)}% Confidence
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {candidate.email && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(candidate.email, `email-${candidate.id}`)}
              className="text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedId === `email-${candidate.id}` ? 'Copied!' : 'Copy Email'}
            </Button>
          )}
          
          {candidate.linkedin_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(candidate.linkedin_url, `linkedin-${candidate.id}`)}
              className="text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedId === `linkedin-${candidate.id}` ? 'Copied!' : 'Copy LinkedIn'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View Results
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isJobCandidatesAgent ? <User className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
            {isJobCandidatesAgent ? `Candidates for "${agent.query}"` : `Results for "${agent.query}"`}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {isJobCandidatesAgent 
              ? `Total: ${candidateContacts.length} candidates found`
              : `Total: ${agent.staged_results.total_jobs} jobs, ${agent.staged_results.total_contacts} contacts, ${agent.staged_results.total_campaigns} campaigns`
            }
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={isJobCandidatesAgent ? "Search candidates, titles, companies..." : "Search jobs, companies, locations..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm bg-background dark:bg-background"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isJobCandidatesAgent ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {isJobCandidatesAgent ? (
                <>
                  <TabsTrigger value="candidates" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Candidates ({candidateContacts.length})
                  </TabsTrigger>
                  <TabsTrigger value="campaigns" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Campaigns ({agent.staged_results.campaigns.length})
                  </TabsTrigger>
                </>
              ) : (
                <>
                  <TabsTrigger value="linkedin" className="flex items-center gap-1">
                    <LinkedinIcon className="h-4 w-4" />
                    LinkedIn ({allLinkedInJobs.length})
                  </TabsTrigger>
                  <TabsTrigger value="other" className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    Other Jobs ({agent.staged_results.other_jobs.length})
                  </TabsTrigger>
                  <TabsTrigger value="contacts" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Contacts ({agent.staged_results.verified_contacts.length})
                  </TabsTrigger>
                  <TabsTrigger value="campaigns" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Campaigns ({agent.staged_results.campaigns.length})
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="linkedin" className="mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                {filteredLinkedInJobs.length > 0 ? (
                  filteredLinkedInJobs.map((job, index) => (
                    <JobCard key={index} job={job} source="LinkedIn" />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <div className="text-muted-foreground">
                      {searchTerm ? 'No LinkedIn jobs match your search.' : 'No LinkedIn jobs found yet.'}
                    </div>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="other" className="mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                {filteredOtherJobs.length > 0 ? (
                  filteredOtherJobs.map((job, index) => (
                    <JobCard key={index} job={job} source={job.source || 'Other'} />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <div className="text-muted-foreground">
                      {searchTerm ? 'No other jobs match your search.' : 'Other job boards being processed...'}
                    </div>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="contacts" className="mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                {agent.staged_results.verified_contacts.length > 0 ? (
                  agent.staged_results.verified_contacts.map((contact, index) => (
                    <ContactCard key={index} contact={contact} />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <div className="text-muted-foreground">
                      Contact discovery in progress...
                    </div>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="campaigns" className="mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                {agent.staged_results.campaigns.length > 0 ? (
                  agent.staged_results.campaigns.map((campaign, index) => (
                    <CampaignCard key={index} campaign={campaign} />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <div className="text-muted-foreground">
                      Campaign creation in progress...
                    </div>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="candidates" className="mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate, index) => (
                    <CandidateCard key={index} candidate={candidate} />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <div className="text-muted-foreground">
                      {searchTerm ? 'No candidates match your search.' : 'No candidates found yet.'}
                    </div>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
