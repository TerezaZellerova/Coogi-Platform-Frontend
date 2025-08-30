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
  Calendar,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

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

export default function LeadsPage() {
  const router = useRouter()
  const { addToast } = useToast()
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

      if (combinedLeads.length === 0) {
        addToast({
          title: "No Data Found",
          message: "No leads found. Create an agent to start generating leads.",
          type: "info"
        })
      }
    } catch (error) {
      console.error('Error loading leads:', error)
      addToast({
        title: "Error Loading Leads",
        message: "Failed to load leads from the database.",
        type: "error"
      })
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
      (lead.location && lead.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'jobs' && lead.type === 'job') ||
      (activeTab === 'contacts' && lead.type === 'contact')
    
    return matchesSearch && matchesTab
  })

  const exportLeads = async () => {
    setExporting(true)
    try {
      const csvData = filteredLeads.map(lead => ({
        Type: lead.type,
        Title: lead.title,
        Name: lead.name || '',
        Email: lead.email || '',
        Company: lead.company,
        Location: lead.location || '',
        Source: lead.source,
        URL: lead.url || '',
        'Created At': new Date(lead.created_at).toLocaleDateString()
      }))

      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvString], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `coogi_leads_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      addToast({
        title: "Export Successful",
        message: `Exported ${filteredLeads.length} leads to CSV`,
        type: "success"
      })
    } catch (error) {
      console.error('Error exporting leads:', error)
      addToast({
        title: "Export Failed",
        message: "Failed to export leads",
        type: "error"
      })
    } finally {
      setExporting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast({
      title: "Copied to clipboard",
      message: text,
      type: "success"
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading leads...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Lead Database</h1>
            <p className="text-muted-foreground">
              Manage and export your leads from progressive agents
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={loadLeads} 
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={exportLeads}
            disabled={exporting || filteredLeads.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All leads combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Opportunities</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobs}</div>
            <p className="text-xs text-muted-foreground">Jobs discovered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts Found</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacts}</div>
            <p className="text-xs text-muted-foreground">Verified contacts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads by name, company, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads ({filteredLeads.length})</CardTitle>
              <CardDescription>
                {activeTab === 'all' ? 'All leads' : activeTab === 'jobs' ? 'Job opportunities' : 'Contact information'}
              </CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'jobs' | 'contacts')}>
              <TabsList>
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="jobs">Jobs ({stats.jobs})</TabsTrigger>
                <TabsTrigger value="contacts">Contacts ({stats.contacts})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? "No leads match your search criteria."
                  : "Create an agent to start generating leads automatically."
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/dashboard')}>
                  Create Agent
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Badge variant={lead.type === 'job' ? 'default' : 'secondary'}>
                          {lead.type === 'job' ? (
                            <><Briefcase className="h-3 w-3 mr-1" /> Job</>
                          ) : (
                            <><User className="h-3 w-3 mr-1" /> Contact</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {lead.title}
                        {lead.name && (
                          <div className="text-sm text-muted-foreground">
                            {lead.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {lead.company}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{lead.email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => lead.email && copyToClipboard(lead.email)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {lead.role && (
                          <div className="text-sm text-muted-foreground">
                            {lead.role}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{lead.location || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.source}</Badge>
                        {lead.verified && (
                          <Badge variant="default" className="ml-1">Verified</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(lead.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
