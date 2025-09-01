'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient, type SESStats, type SESEmailRequest, type SESCampaignRequest, type SESTemplateRequest } from '@/lib/api-production'
import { 
  Mail, 
  Send,
  Users, 
  TrendingUp,
  BarChart3,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  MessageSquare,
  FileText,
  Loader2
} from 'lucide-react'

export default function SESEmailManagement() {
  const [stats, setStats] = useState<SESStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  // Send Email Form
  const [emailForm, setEmailForm] = useState<SESEmailRequest>({
    to_emails: [''],
    subject: '',
    body_html: '',
    body_text: '',
    from_email: '',
    reply_to: ''
  })

  // Campaign Form
  const [campaignForm, setCampaignForm] = useState<SESCampaignRequest>({
    query: '',
    campaign_name: '',
    max_leads: 50,
    min_score: 0.7,
    from_email: '',
    subject: '',
    email_template: '',
    send_immediately: false
  })

  // Template Form
  const [templateForm, setTemplateForm] = useState<SESTemplateRequest>({
    template_name: '',
    subject: '',
    html_part: '',
    text_part: ''
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getSESStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load SES stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    try {
      setActionLoading('send-email')
      
      // Filter out empty email addresses
      const cleanEmails = emailForm.to_emails.filter(email => email.trim() !== '')
      
      if (cleanEmails.length === 0) {
        alert('Please add at least one email address')
        return
      }

      const result = await apiClient.sendSESEmail({
        ...emailForm,
        to_emails: cleanEmails
      })
      
      alert(`Email sent successfully! Message ID: ${result.message_id}`)
      setShowSendModal(false)
      
      // Reset form
      setEmailForm({
        to_emails: [''],
        subject: '',
        body_html: '',
        body_text: '',
        from_email: '',
        reply_to: ''
      })
      
      loadStats() // Refresh stats
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('Failed to send email. Please check your configuration.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateCampaign = async () => {
    try {
      setActionLoading('create-campaign')
      
      const result = await apiClient.createSESCampaign(campaignForm)
      
      alert(`Campaign created! Found ${result.leads_found} leads, sent ${result.emails_sent} emails.`)
      setShowCampaignModal(false)
      
      // Reset form
      setCampaignForm({
        query: '',
        campaign_name: '',
        max_leads: 50,
        min_score: 0.7,
        from_email: '',
        subject: '',
        email_template: '',
        send_immediately: false
      })
      
      loadStats() // Refresh stats
    } catch (error) {
      console.error('Failed to create campaign:', error)
      alert('Failed to create campaign. Please check your configuration.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      setActionLoading('create-template')
      
      const result = await apiClient.createSESTemplate(templateForm)
      
      alert(`Template "${result.template_name}" created successfully!`)
      setShowTemplateModal(false)
      
      // Reset form
      setTemplateForm({
        template_name: '',
        subject: '',
        html_part: '',
        text_part: ''
      })
    } catch (error) {
      console.error('Failed to create template:', error)
      alert('Failed to create template. Please check your configuration.')
    } finally {
      setActionLoading(null)
    }
  }

  const addEmailField = () => {
    setEmailForm(prev => ({
      ...prev,
      to_emails: [...prev.to_emails, '']
    }))
  }

  const removeEmailField = (index: number) => {
    setEmailForm(prev => ({
      ...prev,
      to_emails: prev.to_emails.filter((_, i) => i !== index)
    }))
  }

  const updateEmailField = (index: number, value: string) => {
    setEmailForm(prev => ({
      ...prev,
      to_emails: prev.to_emails.map((email, i) => i === index ? value : email)
    }))
  }

  const getQuotaUsageColor = () => {
    if (!stats) return 'bg-gray-400'
    const usage = (stats.sent_last_24_hours / stats.send_quota) * 100
    if (usage < 50) return 'bg-green-500'
    if (usage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getBounceRateColor = () => {
    if (!stats) return 'text-gray-600'
    if (stats.bounce_rate < 2) return 'text-green-600 dark:text-green-400'
    if (stats.bounce_rate < 5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Amazon SES</h1>
            <p className="text-muted-foreground">
              Manage email campaigns with Amazon Simple Email Service
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Amazon SES</h1>
          <p className="text-muted-foreground">
            Manage email campaigns with Amazon Simple Email Service
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Quota</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.sent_last_24_hours || 0} / {stats?.send_quota || 0}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all ${getQuotaUsageColor()}`}
                style={{ 
                  width: stats ? `${Math.min((stats.sent_last_24_hours / stats.send_quota) * 100, 100)}%` : '0%' 
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Emails sent today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Send Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.max_send_rate || 0}/sec
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum sending rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBounceRateColor()}`}>
              {stats?.bounce_rate?.toFixed(2) || '0.00'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Keep below 5%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {stats?.reputation?.delivery_delay ? (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Delayed
                </Badge>
              ) : (
                <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Good
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Email reputation status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowSendModal(true)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Email
            </CardTitle>
            <CardDescription>
              Send individual or bulk emails instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Send Now
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCampaignModal(true)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Create Campaign
            </CardTitle>
            <CardDescription>
              Launch automated recruiting campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Launch Campaign
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTemplateModal(true)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Create reusable email templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Create Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Send Email Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Email via SES
            </DialogTitle>
            <DialogDescription>
              Send emails using Amazon SES with high deliverability
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="from-email">From Email*</Label>
              <Input
                id="from-email"
                type="email"
                placeholder="your-email@company.com"
                value={emailForm.from_email}
                onChange={(e) => setEmailForm(prev => ({ ...prev, from_email: e.target.value }))}
              />
            </div>

            <div>
              <Label>To Emails*</Label>
              {emailForm.to_emails.map((email, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    type="email"
                    placeholder="recipient@company.com"
                    value={email}
                    onChange={(e) => updateEmailField(index, e.target.value)}
                  />
                  {emailForm.to_emails.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeEmailField(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addEmailField} className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Add Email
              </Button>
            </div>

            <div>
              <Label htmlFor="reply-to">Reply To (Optional)</Label>
              <Input
                id="reply-to"
                type="email"
                placeholder="replies@company.com"
                value={emailForm.reply_to}
                onChange={(e) => setEmailForm(prev => ({ ...prev, reply_to: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject*</Label>
              <Input
                id="subject"
                placeholder="Email subject line"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="body-text">Plain Text Content*</Label>
              <textarea
                id="body-text"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Plain text version of your email..."
                value={emailForm.body_text}
                onChange={(e) => setEmailForm(prev => ({ ...prev, body_text: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="body-html">HTML Content (Optional)</Label>
              <textarea
                id="body-html"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="<html><body>HTML version of your email...</body></html>"
                value={emailForm.body_html}
                onChange={(e) => setEmailForm(prev => ({ ...prev, body_html: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail} 
              disabled={actionLoading === 'send-email' || !emailForm.from_email || !emailForm.subject || !emailForm.body_text}
            >
              {actionLoading === 'send-email' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Modal */}
      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Create SES Campaign
            </DialogTitle>
            <DialogDescription>
              Create an automated recruiting campaign using Amazon SES
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaign-name">Campaign Name*</Label>
              <Input
                id="campaign-name"
                placeholder="Q1 2025 Engineers Campaign"
                value={campaignForm.campaign_name}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, campaign_name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="job-query">Job Search Query*</Label>
              <Input
                id="job-query"
                placeholder="software engineer remote san francisco"
                value={campaignForm.query}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, query: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-leads">Max Leads</Label>
                <Input
                  id="max-leads"
                  type="number"
                  min="1"
                  max="1000"
                  value={campaignForm.max_leads}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, max_leads: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="min-score">Min Score (0-1)</Label>
                <Input
                  id="min-score"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={campaignForm.min_score}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, min_score: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="campaign-from-email">From Email*</Label>
              <Input
                id="campaign-from-email"
                type="email"
                placeholder="recruiting@company.com"
                value={campaignForm.from_email}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, from_email: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="campaign-subject">Subject Line*</Label>
              <Input
                id="campaign-subject"
                placeholder="Exciting opportunity at {company}"
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="email-template">Email Template*</Label>
              <textarea
                id="email-template"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Hi {name}, I noticed your {job_title} role at {company}..."
                value={campaignForm.email_template}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, email_template: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use placeholders: {'{name}'}, {'{company}'}, {'{job_title}'}, {'{email}'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="send-immediately"
                checked={campaignForm.send_immediately}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, send_immediately: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="send-immediately">Send emails immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCampaign} 
              disabled={actionLoading === 'create-campaign' || !campaignForm.campaign_name || !campaignForm.query || !campaignForm.from_email}
            >
              {actionLoading === 'create-campaign' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create Email Template
            </DialogTitle>
            <DialogDescription>
              Create a reusable email template for SES campaigns
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name*</Label>
              <Input
                id="template-name"
                placeholder="recruiting-outreach-v1"
                value={templateForm.template_name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, template_name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="template-subject">Subject*</Label>
              <Input
                id="template-subject"
                placeholder="{{subject}} - Opportunity at {{company_name}}"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="template-text">Text Content*</Label>
              <textarea
                id="template-text"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Hi {{name}}, I saw your work at {{company}}..."
                value={templateForm.text_part}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, text_part: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="template-html">HTML Content (Optional)</Label>
              <textarea
                id="template-html"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="<html><body><h1>Hi {{name}}</h1>...</body></html>"
                value={templateForm.html_part}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, html_part: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate} 
              disabled={actionLoading === 'create-template' || !templateForm.template_name || !templateForm.subject || !templateForm.text_part}
            >
              {actionLoading === 'create-template' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
