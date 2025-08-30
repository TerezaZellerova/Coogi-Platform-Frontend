'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient, type ProgressiveJob, type ProgressiveContact } from '@/lib/api-production'
import { 
  Mail, 
  User, 
  Building, 
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  Copy,
  Briefcase,
  Users,
  Calendar
} from 'lucide-react'

interface CombinedLead {
  id: string
  type: 'job' | 'contact'
  title: string
  name?: string
  email?: string
  company: string
  location?: string
  role?: string
  source: string
  url?: string
  verified?: boolean
  created_at: string
}

export default function LeadManagement() {
  const [leads, setLeads] = useState<CombinedLead[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'contacts'>('all')
  const [stats, setStats] = useState({ jobs: 0, contacts: 0, total: 0 })

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    setLoading(true)
    try {
      // Fetch both jobs and contacts from progressive agents
      const [jobsResponse, contactsResponse] = await Promise.all([
        apiClient.getProgressiveJobs(200),
        apiClient.getProgressiveContacts(200)
      ])

      const combinedLeads: CombinedLead[] = []

      // Add jobs as leads
      if (jobsResponse.success) {
        jobsResponse.data.forEach((job: ProgressiveJob) => {
          combinedLeads.push({
            id: `job_${job.id}`,
            type: 'job',
            title: job.title,
            company: job.company,
            location: job.location,
            source: job.site,
            url: job.url,
            created_at: job.created_at
          })
        })
      }

      // Add contacts as leads
      if (contactsResponse.success) {
        contactsResponse.data.forEach((contact: ProgressiveContact) => {
          combinedLeads.push({
            id: `contact_${contact.id}`,
            type: 'contact',
            title: contact.title || contact.role || 'Contact',
            name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
            email: contact.email,
            company: contact.company || 'Unknown',
            role: contact.role || contact.title,
            source: contact.source,
            url: contact.linkedin_url,
            verified: contact.verified,
            created_at: contact.created_at
          })
        })
      }

      // Sort by creation date (newest first)
      combinedLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setLeads(combinedLeads)
      setStats({
        jobs: jobsResponse.data?.length || 0,
        contacts: contactsResponse.data?.length || 0,
        total: combinedLeads.length
      })
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || (
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.role && lead.role.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'jobs' && lead.type === 'job') ||
      (activeTab === 'contacts' && lead.type === 'contact')
    
    return matchesSearch && matchesTab
  })

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id))
    }
  }

  const exportLeads = async () => {
    try {
      setExporting(true)
      console.log('Exporting leads:', filteredLeads.length)
      
      if (filteredLeads.length === 0) {
        console.warn('No leads to export')
        // Use a better notification instead of alert
        if (typeof window !== 'undefined') {
          alert('No leads to export. Please make sure you have data loaded.')
        }
        return
      }

      // Create proper CSV headers
      const headers = ['Type', 'Title/Name', 'Email', 'Company', 'Location/Role', 'Source', 'URL']
      
      const csvData = filteredLeads.map(lead => {
        if (lead.type === 'contact') {
          return [
            'Contact',
            lead.name || '',
            lead.email || '',
            lead.company,
            lead.role || lead.location || '',
            lead.source,
            lead.url || ''
          ]
        } else {
          return [
            'Job',
            lead.title,
            '', // No email for jobs
            lead.company,
            lead.location || '',
            lead.source,
            lead.url || ''
          ]
        }
      })
      
      // Escape CSV values and wrap in quotes if they contain commas
      const escapeCsvValue = (value: string) => {
        if (!value) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }
      
      const csvRows = [
        headers.join(','),
        ...csvData.map(row => row.map(escapeCsvValue).join(','))
      ]
      
      const csvContent = '\uFEFF' + csvRows.join('\r\n') // Add BOM for Excel compatibility
      console.log('CSV content length:', csvContent.length)
      
      // Create and download the file with better browser compatibility
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      // Use different download methods for better compatibility
      if ((navigator as any).msSaveBlob) {
        // IE 10+
        (navigator as any).msSaveBlob(blob, `coogi-leads-${new Date().toISOString().split('T')[0]}.csv`)
      } else {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `coogi-leads-${new Date().toISOString().split('T')[0]}.csv`
        link.style.display = 'none'
        
        // Ensure the link is added to the document
        document.body.appendChild(link)
        
        // Force download with a small delay for better reliability
        setTimeout(() => {
          link.click()
          
          // Clean up after a short delay
          setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
          }, 100)
        }, 10)
      }
      
      console.log('✅ CSV export completed successfully')
    } catch (error) {
      console.error('Error exporting leads:', error)
      if (typeof window !== 'undefined') {
        alert('Failed to export leads. Please try again.')
      }
    } finally {
      setExporting(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Use the modern clipboard API
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'absolute'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      console.log('✅ URL copied to clipboard')
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      // Fallback: show the URL in an alert
      if (typeof window !== 'undefined') {
        window.prompt('Copy this URL:', text)
      }
    }
  }

  const getTypeBadge = (type: 'job' | 'contact') => {
    const variants = {
      job: 'default',
      contact: 'secondary'
    }
    const labels = {
      job: 'Job',
      contact: 'Contact'
    }
    return <Badge variant={variants[type] as any}>{labels[type]}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lead Database</h2>
          <p className="text-muted-foreground">
            Manage and organize your discovered leads from agent runs
          </p>
        </div>
        <Button onClick={loadLeads} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.jobs} jobs + {stats.contacts} contacts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Opportunities</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobs}</div>
            <p className="text-xs text-muted-foreground">
              From agent searches
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Contacts</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacts}</div>
            <p className="text-xs text-muted-foreground">
              Ready for outreach
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={exportLeads}
            variant="outline"
            size="sm"
            disabled={filteredLeads.length === 0 || exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Leads ({filteredLeads.length})
          </CardTitle>
          <CardDescription>
            Jobs and contacts discovered by your agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="jobs">Jobs ({stats.jobs})</TabsTrigger>
              <TabsTrigger value="contacts">Contacts ({stats.contacts})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No leads found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Create an agent to start discovering leads.'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <input
                            type="checkbox"
                            checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                            onChange={handleSelectAll}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Title/Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead.id)}
                              onChange={() => handleSelectLead(lead.id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(lead.type)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {lead.type === 'contact' ? lead.name : lead.title}
                            </div>
                            {lead.role && (
                              <div className="text-sm text-muted-foreground">{lead.role}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{lead.company}</div>
                            {lead.location && (
                              <div className="text-sm text-muted-foreground">{lead.location}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {lead.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span className="text-sm">{lead.email}</span>
                                {lead.verified && (
                                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{lead.source}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDate(lead.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead.url && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(lead.url!)}
                                  title="Copy URL"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(lead.url, '_blank')}
                                  title="Open URL"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
