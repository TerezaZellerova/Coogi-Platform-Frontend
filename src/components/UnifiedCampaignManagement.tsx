'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Mail, 
  Users, 
  TrendingUp,
  Plus,
  RefreshCw,
  Send,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Campaign {
  campaign_id: string
  name: string
  status: 'sending' | 'completed' | 'paused' | 'failed'
  platform: string
  subject_line: string
  target_type: string
  contacts_count: number
  emails_sent: number
  emails_failed?: number
  created_at: string
}

interface CreateCampaignRequest {
  name: string
  subject_line: string
  email_body: string
  from_email: string
  from_name: string
  search_query?: string
  target_type: 'hiring_managers' | 'job_candidates'
  max_contacts: number
  location?: string
}

export default function UnifiedCampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCampaign, setNewCampaign] = useState<CreateCampaignRequest>({
    name: '',
    subject_line: '',
    email_body: '',
    from_email: 'outreach@coogi.com',
    from_name: 'Coogi Team',
    search_query: '',
    target_type: 'hiring_managers',
    max_contacts: 50,
    location: 'United States'
  })

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

  useEffect(() => {
    loadCampaigns()
  }, [])

  const getAuthToken = () => {
    const authData = localStorage.getItem('coogiAuth')
    if (authData) {
      try {
        const auth = JSON.parse(authData)
        return auth.token
      } catch (e) {
        return null
      }
    }
    return null
  }

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE}/api/unified-campaigns/campaigns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      } else {
        console.error('Failed to load campaigns:', response.status)
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject_line || !newCampaign.email_body) {
      alert('Please fill in all required fields')
      return
    }

    setCreating(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE}/api/unified-campaigns/create-ses-campaign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCampaign)
      })

      if (response.ok) {
        const result = await response.json()
        setShowCreateModal(false)
        setNewCampaign({
          name: '',
          subject_line: '',
          email_body: '',
          from_email: 'outreach@coogi.com',
          from_name: 'Coogi Team',
          search_query: '',
          target_type: 'hiring_managers',
          max_contacts: 50,
          location: 'United States'
        })
        await loadCampaigns()
        alert(`✅ Campaign "${result.name}" created! Found ${result.contacts_found} contacts. Emails are being sent via Amazon SES.`)
      } else {
        const error = await response.json()
        alert(`❌ Failed to create campaign: ${error.detail}`)
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert(`❌ Error creating campaign: ${error}`)
    } finally {
      setCreating(false)
    }
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const variants = {
      sending: { variant: 'default', color: 'text-blue-600', icon: Send },
      completed: { variant: 'default', color: 'text-green-600', icon: CheckCircle },
      paused: { variant: 'secondary', color: 'text-yellow-600', icon: Clock },
      failed: { variant: 'destructive', color: 'text-red-600', icon: AlertCircle }
    }
    
    const config = variants[status] || variants.failed
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant as any} className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const defaultEmailTemplates = {
    hiring_managers: `Hi {{first_name}},

I hope this message finds you well. I noticed that {{company}} is actively hiring, and I wanted to reach out regarding our specialized recruiting services.

We help companies like {{company}} find top-tier talent quickly and efficiently. Our AI-powered platform has successfully placed candidates at similar organizations, reducing time-to-hire by 60%.

Would you be interested in learning how we can support your hiring goals?

Best regards,
{{from_name}}`,
    
    job_candidates: `Hi {{first_name}},

I hope you're doing well. I came across your profile and was impressed by your experience at {{company}}.

We're currently working with several exciting companies that are looking for professionals with your background in {{title}}. These are high-growth opportunities with competitive compensation packages.

Would you be open to a brief conversation about some exciting opportunities?

Best regards,
{{from_name}}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Unified Email Campaigns
              </CardTitle>
              <CardDescription>
                Real SES-powered campaigns with no mock logic • Amazon SES integration
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadCampaigns} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading campaigns...</p>
            </div>
          ) : campaigns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.campaign_id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {campaign.target_type === 'hiring_managers' ? 'Hiring Managers' : 'Job Candidates'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>{campaign.contacts_count}</TableCell>
                    <TableCell>
                      <span className="font-medium">{campaign.emails_sent}</span>
                      {campaign.emails_failed && campaign.emails_failed > 0 && (
                        <span className="text-red-500 text-sm ml-1">
                          ({campaign.emails_failed} failed)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(campaign.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Create your first SES-powered email campaign</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New SES Campaign</DialogTitle>
            <DialogDescription>
              Create a real email campaign powered by Amazon SES with automatic contact finding
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Campaign Name *</Label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Tech Hiring Managers Q1"
                />
              </div>
              <div>
                <Label>Target Type *</Label>
                <select
                  value={newCampaign.target_type}
                  onChange={(e) => 
                    setNewCampaign(prev => ({
                      ...prev, 
                      target_type: e.target.value as 'hiring_managers' | 'job_candidates',
                      email_body: defaultEmailTemplates[e.target.value as 'hiring_managers' | 'job_candidates']
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="hiring_managers">Hiring Managers</option>
                  <option value="job_candidates">Job Candidates</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Search Query *</Label>
                <Input
                  value={newCampaign.search_query}
                  onChange={(e) => setNewCampaign(prev => ({...prev, search_query: e.target.value}))}
                  placeholder="e.g., Software Engineer, Sales Manager"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={newCampaign.location}
                  onChange={(e) => setNewCampaign(prev => ({...prev, location: e.target.value}))}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>

            <div>
              <Label>Subject Line *</Label>
              <Input
                value={newCampaign.subject_line}
                onChange={(e) => setNewCampaign(prev => ({...prev, subject_line: e.target.value}))}
                placeholder="e.g., Partnership Opportunity - {{company}}"
              />
            </div>

            <div>
              <Label>Email Body * (supports variables: first_name, company, title)</Label>
              <textarea
                value={newCampaign.email_body}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewCampaign(prev => ({...prev, email_body: e.target.value}))}
                placeholder="Your personalized email content..."
                rows={8}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Max Contacts</Label>
                <Input
                  type="number"
                  value={newCampaign.max_contacts}
                  onChange={(e) => setNewCampaign(prev => ({...prev, max_contacts: parseInt(e.target.value) || 50}))}
                  placeholder="50"
                />
              </div>
              <div>
                <Label>From Email</Label>
                <Input
                  value={newCampaign.from_email}
                  onChange={(e) => setNewCampaign(prev => ({...prev, from_email: e.target.value}))}
                />
              </div>
              <div>
                <Label>From Name</Label>
                <Input
                  value={newCampaign.from_name}
                  onChange={(e) => setNewCampaign(prev => ({...prev, from_name: e.target.value}))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={createCampaign} disabled={creating}>
              {creating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating & Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create & Send Campaign
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
