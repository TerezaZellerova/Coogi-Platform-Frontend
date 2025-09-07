'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { apiClient, type Campaign, type CreateCampaignRequest } from '@/lib/api-production'
import { 
  Mail, 
  Users, 
  TrendingUp,
  Play,
  Pause,
  BarChart3,
  ExternalLink,
  RefreshCw,
  Plus,
  Search,
  X,
  Calendar,
  Clock,
  User,
  Info
} from 'lucide-react'

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [newCampaignSubject, setNewCampaignSubject] = useState('')
  const [newCampaignEmailBody, setNewCampaignEmailBody] = useState('')
  const [newCampaignPlatform, setNewCampaignPlatform] = useState<'aws_ses' | 'instantly'>('aws_ses')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCampaigns()
  }, [])

  useEffect(() => {
    // Filter campaigns based on search query
    if (!searchQuery.trim()) {
      setFilteredCampaigns(campaigns)
    } else {
      const filtered = campaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.batch_id && campaign.batch_id.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredCampaigns(filtered)
    }
  }, [campaigns, searchQuery])

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      const fetchedCampaigns = await apiClient.getCampaigns()
      setCampaigns(fetchedCampaigns)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    // Validate required fields
    const name = newCampaignName.trim()
    const subject = newCampaignSubject.trim()
    const body = newCampaignEmailBody.trim()
    
    if (!name || !subject || !body) {
      alert('Please fill in all required fields: Campaign Name, Subject Line, and Email Body')
      return
    }

    // Validate email body has some personalization
    if (!body.includes('{{') && !body.includes('{first_name}') && !body.includes('{company}')) {
      const confirmed = confirm(
        'Your email body doesn\'t seem to include personalization variables like {{first_name}} or {{company}}. ' +
        'This may result in generic emails. Do you want to continue anyway?'
      )
      if (!confirmed) return
    }

    setActionLoading('create')
    try {
      const campaignRequest: CreateCampaignRequest = {
        name: name,
        platform: newCampaignPlatform,
        subject_line: subject,
        from_email: 'outreach@coogi.ai',
        from_name: 'Coogi Team',
        email_sequence: [{
          step_number: 1,
          subject: subject,
          body: body,
          delay_days: 0
        }],
        contacts: [] // Will be populated when contacts are added
      }

      const response = await apiClient.createProductionCampaign(campaignRequest)
      
      // Create a campaign object for the UI
      const newCampaign: Campaign = {
        id: response.campaign_id,
        name: name,
        status: 'draft',
        platform: newCampaignPlatform,
        subject_line: subject,
        from_email: 'outreach@coogi.ai',
        from_name: 'Coogi Team',
        email_sequence: campaignRequest.email_sequence,
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
        updated_at: new Date().toISOString(),
        provider_campaign_id: response.provider_campaign_id
      }

      setCampaigns(prev => [newCampaign, ...prev])
      setShowCreateModal(false)
      resetCreateForm()
      
      // Show success message
      alert(`✅ Campaign "${name}" created successfully! You can now add contacts and launch it.`)
      
    } catch (error) {
      console.error('Error creating campaign:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`❌ Failed to create campaign: ${errorMessage}. Please check all fields and try again.`)
    } finally {
      setActionLoading(null)
    }
  }

  const resetCreateForm = () => {
    setNewCampaignName('')
    setNewCampaignSubject('')
    setNewCampaignEmailBody('')
    setNewCampaignPlatform('instantly')
  }

  const openCreateModal = () => {
    resetCreateForm()
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    resetCreateForm()
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const openCampaignDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowDetailsModal(true)
  }

  const closeCampaignDetails = () => {
    setShowDetailsModal(false)
    setSelectedCampaign(null)
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const variants = {
      active: 'default',
      paused: 'secondary',
      draft: 'outline',
      completed: 'secondary',
      failed: 'destructive'
    }
    const colors = {
      active: 'text-green-600 dark:text-green-400',
      paused: 'text-yellow-600 dark:text-yellow-400',
      draft: 'text-gray-600 dark:text-gray-400',
      completed: 'text-blue-600 dark:text-blue-400',
      failed: 'text-red-600 dark:text-red-400'
    }
    return (
      <Badge variant={variants[status] as any} className={colors[status]}>
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Campaign Action Handlers
  const handleStartCampaign = async (campaignId: string) => {
    setActionLoading(`start-${campaignId}`)
    try {
      await apiClient.startCampaign(campaignId)
      // Update campaign status in local state
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId ? { ...c, status: 'active' as const } : c
      ))
    } catch (error) {
      console.error('Error starting campaign:', error)
      alert('Failed to start campaign')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    setActionLoading(`pause-${campaignId}`)
    try {
      await apiClient.pauseCampaign(campaignId)
      // Update campaign status in local state
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId ? { ...c, status: 'paused' as const } : c
      ))
    } catch (error) {
      console.error('Error pausing campaign:', error)
      alert('Failed to pause campaign')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResumeCampaign = async (campaignId: string) => {
    setActionLoading(`resume-${campaignId}`)
    try {
      await apiClient.resumeCampaign(campaignId)
      // Update campaign status in local state
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId ? { ...c, status: 'active' as const } : c
      ))
    } catch (error) {
      console.error('Error resuming campaign:', error)
      alert('Failed to resume campaign')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSyncStats = async (campaignId: string) => {
    setActionLoading(`sync-${campaignId}`)
    try {
      await apiClient.syncCampaignStats(campaignId)
      // Reload campaigns to get updated stats
      await loadCampaigns()
    } catch (error) {
      console.error('Error syncing campaign stats:', error)
      alert('Failed to sync campaign stats')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSyncAllStats = async () => {
    setActionLoading('sync-all')
    try {
      // Sync stats for all active campaigns
      const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'paused')
      
      if (activeCampaigns.length === 0) {
        alert('📊 No active campaigns to sync stats for. Create and launch campaigns to see live statistics.')
        return
      }

      // Show progress feedback
      let successCount = 0
      let errorCount = 0

      // Sync all campaigns in parallel
      const syncPromises = activeCampaigns.map(async (campaign) => {
        try {
          await apiClient.syncCampaignStats(campaign.id)
          successCount++
          return { success: true, campaign: campaign.name }
        } catch (error) {
          console.error(`Failed to sync campaign ${campaign.id}:`, error)
          errorCount++
          return { success: false, campaign: campaign.name, error }
        }
      })
      
      await Promise.allSettled(syncPromises)
      
      // Reload campaigns to get updated stats
      await loadCampaigns()
      
      // Show detailed feedback
      if (errorCount === 0) {
        alert(`✅ Successfully synced stats for all ${successCount} campaigns!`)
      } else if (successCount > 0) {
        alert(`⚠️ Synced ${successCount} campaigns successfully, but ${errorCount} failed. Check console for details.`)
      } else {
        alert(`❌ Failed to sync stats for all campaigns. Please check your internet connection and try again.`)
      }
      
    } catch (error) {
      console.error('Error syncing all campaign stats:', error)
      alert('❌ Failed to sync campaign stats. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="shadow-lg border-0 bg-white dark:bg-slate-900 backdrop-blur-sm border-gray-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-56"></div>
              </div>
              <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
            </div>
          </CardHeader>
          <CardContent className="bg-white dark:bg-slate-900">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0 bg-white dark:bg-slate-900 backdrop-blur-sm border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-slate-100">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                Email Campaigns
              </CardTitle>
              <CardDescription className="mt-2 text-gray-600 dark:text-slate-300">
                Manage your AI-powered email outreach campaigns with Instantly.ai integration • {campaigns.length} total campaigns
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadCampaigns}
                disabled={loading}
                className="shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAllStats}
                disabled={actionLoading === 'sync-all' || campaigns.length === 0}
                className="shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <TrendingUp className={`w-4 h-4 mr-2 ${actionLoading === 'sync-all' ? 'animate-pulse' : ''}`} />
                {actionLoading === 'sync-all' ? 'Syncing...' : 'Sync All Stats'}
              </Button>
              <Button
                size="sm"
                onClick={openCreateModal}
                disabled={actionLoading === 'create'}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {campaigns.length > 0 ? (
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
                <Input
                  placeholder="Search campaigns by name, status, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border-gray-300 dark:border-slate-600 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
                  Showing {filteredCampaigns.length} of {campaigns.length} campaigns
                </p>
              )}
            </div>

            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700/50">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Total Campaigns</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{campaigns.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg border border-green-200 dark:border-green-700/50">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-300 font-medium">Active</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-200">
                      {campaigns.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700/50">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-300 font-medium">Total Leads</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">
                      {campaigns.reduce((sum, c) => sum + c.target_count, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg border border-orange-200 dark:border-orange-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-300 font-medium">Avg. Open Rate</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-200">
                      {campaigns.length > 0 
                        ? Math.round(campaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / campaigns.length)
                        : 0
                      }%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-slate-900">
                  <TableRow>
                    <TableHead className="text-gray-700 dark:text-slate-300 font-medium">Campaign Name</TableHead>
                    <TableHead className="text-gray-700 dark:text-slate-300 font-medium">Status</TableHead>
                    <TableHead className="text-gray-700 dark:text-slate-300 font-medium">Leads</TableHead>
                    <TableHead className="text-gray-700 dark:text-slate-300 font-medium">Open Rate</TableHead>
                    <TableHead className="text-gray-700 dark:text-slate-300 font-medium">Reply Rate</TableHead>
                    <TableHead className="text-gray-700 dark:text-slate-300 font-medium">Created</TableHead>
                    <TableHead className="text-gray-700 dark:text-slate-300 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800">
                        <TableCell className="text-gray-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-slate-100">{campaign.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {campaign.batch_id && (
                                  <span className="text-xs text-gray-600 dark:text-slate-400">ID: {campaign.batch_id}</span>
                                )}
                                {/* Platform Badge */}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    campaign.platform === 'instantly' 
                                      ? 'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:bg-purple-900/20'
                                      : 'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:bg-gray-900/20'
                                  }`}
                                >
                                  {campaign.platform === 'instantly' ? '⚡ Instantly' : 
                                   '🏠 Internal'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-slate-100">
                          {getStatusBadge(campaign.status)}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-slate-100">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                            {campaign.target_count}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-slate-100">
                          {campaign.open_rate ? `${campaign.open_rate}%` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-slate-100">
                          {campaign.reply_rate ? `${campaign.reply_rate}%` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-slate-100">
                          {formatDate(campaign.created_at)}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-slate-100">
                          <div className="flex items-center gap-1">
                            {/* Start/Pause Campaign */}
                            {campaign.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartCampaign(campaign.id)}
                                disabled={actionLoading === `start-${campaign.id}`}
                                className="hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400"
                                title="Start Campaign"
                              >
                                {actionLoading === `start-${campaign.id}` ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            {campaign.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePauseCampaign(campaign.id)}
                                disabled={actionLoading === `pause-${campaign.id}`}
                                className="hover:bg-yellow-100 dark:hover:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
                                title="Pause Campaign"
                              >
                                {actionLoading === `pause-${campaign.id}` ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Pause className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            {campaign.status === 'paused' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResumeCampaign(campaign.id)}
                                disabled={actionLoading === `resume-${campaign.id}`}
                                className="hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400"
                                title="Resume Campaign"
                              >
                                {actionLoading === `resume-${campaign.id}` ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            
                            {/* Sync Stats */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSyncStats(campaign.id)}
                              disabled={actionLoading === `sync-${campaign.id}`}
                              className="hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400"
                              title="Sync Stats"
                            >
                              {actionLoading === `sync-${campaign.id}` ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </Button>

                            {/* View Details */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCampaignDetails(campaign)}
                              className="hover:bg-gray-100 dark:hover:bg-slate-600"
                              title="View Details"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>

                            {/* Open in Provider */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const platformUrls = {
                                  instantly: 'https://app.instantly.ai/app/dashboard',
                                  internal: '#'
                                }
                                window.open(platformUrls[campaign.platform] || platformUrls.instantly, '_blank')
                              }}
                              className="hover:bg-gray-100 dark:hover:bg-slate-600"
                              title={`Open in ${campaign.platform === 'instantly' ? 'Instantly.ai' : 'Platform'}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="bg-white dark:bg-slate-800">
                      <TableCell colSpan={7} className="text-center py-8 text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-800">
                        {searchQuery ? (
                          <div>
                            <Search className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-slate-500" />
                            <p className="text-gray-600 dark:text-slate-400">No campaigns match your search query</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearSearch}
                              className="mt-2 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                              Clear search
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-600 dark:text-slate-400">No campaigns available</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        ) : (
          <CardContent className="bg-white dark:bg-slate-800">
            <div className="text-center py-12 bg-white dark:bg-slate-800">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                Create your first email campaign to start reaching out to leads
              </p>
              <Button
                onClick={openCreateModal}
                disabled={actionLoading === 'create'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Campaign Creation Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              Create New Campaign
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new email campaign that will be pushed to your chosen platform. All fields are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Campaign Name */}
            <div className="grid gap-2">
              <Label htmlFor="campaign-name" className="text-foreground font-medium">
                Campaign Name *
              </Label>
              <Input
                id="campaign-name"
                placeholder="e.g., Q1 2025 SaaS Outreach"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                disabled={actionLoading === 'create'}
              />
            </div>

            {/* Platform Selection */}
            <div className="grid gap-2">
              <Label htmlFor="platform" className="text-foreground font-medium">
                Platform *
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setNewCampaignPlatform('instantly')}
                  disabled={actionLoading === 'create'}
                  className="flex-1"
                >
                  ⚡ Instantly.ai (Primary Platform)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Using Instantly.ai for reliable email campaign management with excellent API support.
              </p>
            </div>

            {/* Subject Line */}
            <div className="grid gap-2">
              <Label htmlFor="subject-line" className="text-foreground font-medium">
                Subject Line *
              </Label>
              <Input
                id="subject-line"
                placeholder="e.g., Quick question about your tech stack"
                value={newCampaignSubject}
                onChange={(e) => setNewCampaignSubject(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                disabled={actionLoading === 'create'}
              />
            </div>

            {/* Email Body */}
            <div className="grid gap-2">
              <Label htmlFor="email-body" className="text-foreground font-medium">
                Email Body *
              </Label>
              <textarea
                id="email-body"
                placeholder={`Hi {{first_name}},

I hope this message finds you well. I noticed your work at {{company}} and wanted to reach out about...

Best regards,
Coogi Team`}
                value={newCampaignEmailBody}
                onChange={(e) => setNewCampaignEmailBody(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={actionLoading === 'create'}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{first_name}}"}, {"{{last_name}}"}, {"{{company}}"} for personalization
              </p>
            </div>

            {/* Validation Message */}
            {(newCampaignName.trim() && newCampaignSubject.trim() && newCampaignEmailBody.trim()) && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ Ready to create campaign "{newCampaignName.trim()}" on Instantly.ai
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeCreateModal}
              disabled={actionLoading === 'create'}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCampaign}
              disabled={!newCampaignName.trim() || !newCampaignSubject.trim() || !newCampaignEmailBody.trim() || actionLoading === 'create'}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              {actionLoading === 'create' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={closeCampaignDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-slate-100">
              Campaign Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-slate-400">
              View campaign information and performance metrics
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-6">
              {/* Campaign Overview */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                  Campaign Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Campaign Name
                    </Label>
                    <p className="text-gray-900 dark:text-slate-100 mt-1">
                      {selectedCampaign.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Subject Line
                    </Label>
                    <p className="text-gray-900 dark:text-slate-100 mt-1">
                      {selectedCampaign.subject_line || 'No subject set'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Status
                    </Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedCampaign.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Platform
                    </Label>
                    <p className="text-gray-900 dark:text-slate-100 mt-1">
                      {selectedCampaign.platform || 'Instantly.ai'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white dark:bg-slate-600 rounded-lg">
                    <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {selectedCampaign.target_count || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Targets</p>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-slate-600 rounded-lg">
                    <Mail className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {selectedCampaign.sent_count || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Sent</p>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-slate-600 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {selectedCampaign.open_count || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Opens</p>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-slate-600 rounded-lg">
                    <Mail className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {selectedCampaign.reply_count || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Replies</p>
                  </div>
                </div>
              </div>

              {/* Email Sequence */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                  Email Sequence
                </h3>
                {selectedCampaign.email_sequence && selectedCampaign.email_sequence.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCampaign.email_sequence.map((step, index) => (
                      <div key={step.step_number} className="bg-white dark:bg-slate-600 rounded-lg p-3 border border-gray-200 dark:border-slate-500">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Step {step.step_number}
                          </Badge>
                          {step.delay_days > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              +{step.delay_days} days
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs font-medium text-gray-600 dark:text-slate-400">Subject:</Label>
                            <p className="text-sm text-gray-900 dark:text-slate-100">{step.subject}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600 dark:text-slate-400">Body:</Label>
                            <p className="text-sm text-gray-900 dark:text-slate-100 whitespace-pre-wrap bg-gray-50 dark:bg-slate-700 p-2 rounded border text-xs">
                              {step.body.substring(0, 150)}{step.body.length > 150 ? '...' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-slate-400 text-sm">No email sequence configured</p>
                )}
              </div>

              {/* Campaign Info */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                  Campaign Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created Date
                    </Label>
                    <p className="text-gray-900 dark:text-slate-100 mt-1">
                      {formatDate(selectedCampaign.created_at)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Updated
                    </Label>
                    <p className="text-gray-900 dark:text-slate-100 mt-1">
                      {selectedCampaign.updated_at ? formatDate(selectedCampaign.updated_at) : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Agent ID
                    </Label>
                    <p className="text-gray-900 dark:text-slate-100 mt-1 font-mono text-sm">
                      {selectedCampaign.agent_id}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Campaign Type
                    </Label>
                    <p className="text-gray-900 dark:text-slate-100 mt-1">
                      Standard Campaign
                    </p>
                  </div>
                  {selectedCampaign.from_email && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        From Email
                      </Label>
                      <p className="text-gray-900 dark:text-slate-100 mt-1 font-mono text-sm">
                        {selectedCampaign.from_email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instantly.ai Features */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                      Instantly.ai Enhanced Features
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                      Your campaigns now leverage Instantly.ai's proven email outreach features:
                    </p>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>• High-deliverability email infrastructure</li>
                      <li>• Advanced email validation and verification</li>
                      <li>• Automated follow-up sequences</li>
                      <li>• Real-time campaign analytics and tracking</li>
                      <li>• Built-in email warmup and reputation management</li>
                      <li>• Integrated lead management and CRM</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* More Features Coming Soon */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Additional Features Coming Soon
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      We're working on additional integration features:
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Direct email content preview and editing</li>
                      <li>• Individual contact status tracking</li>
                      <li>• Advanced analytics dashboard integration</li>
                      <li>• Automated campaign optimization suggestions</li>
                      <li>• Multi-platform campaign management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <div className="flex items-center gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => selectedCampaign && handleSyncStats(selectedCampaign.id)}
                disabled={!selectedCampaign || actionLoading === `sync-${selectedCampaign.id}`}
                className="flex items-center gap-2"
              >
                {selectedCampaign && actionLoading === `sync-${selectedCampaign.id}` ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sync Now
              </Button>
              <div className="flex-1"></div>
              <Button variant="outline" onClick={closeCampaignDetails} className="bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border-gray-300 dark:border-slate-600">
                Close
              </Button>
              <Button 
                onClick={() => {
                  if (selectedCampaign) {
                    const platformUrls = {
                      instantly: 'https://app.instantly.ai/app/dashboard',
                      internal: '#'
                    }
                    window.open(platformUrls[selectedCampaign.platform] || platformUrls.instantly, '_blank')
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in {selectedCampaign?.platform === 'instantly' ? 'Instantly' : 'Platform'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
