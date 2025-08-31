'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { apiClient, type Campaign } from '@/lib/api-production'
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
    if (!newCampaignName.trim()) return

    setActionLoading('create')
    try {
      const newCampaign = await apiClient.createCampaign(newCampaignName.trim(), [])
      setCampaigns(prev => [newCampaign, ...prev])
      setShowCreateModal(false)
      setNewCampaignName('')
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign')
    } finally {
      setActionLoading(null)
    }
  }

  const openCreateModal = () => {
    setNewCampaignName('')
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setNewCampaignName('')
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
      draft: 'outline'
    }
    const colors = {
      active: 'text-green-600 dark:text-green-400',
      paused: 'text-yellow-600 dark:text-yellow-400',
      draft: 'text-gray-600 dark:text-gray-400'
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
                Manage your AI-powered email outreach campaigns with SmartLead.ai integration • {campaigns.length} total campaigns
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
                      {campaigns.reduce((sum, c) => sum + c.leads_count, 0)}
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
                              {campaign.batch_id && (
                                <div className="text-xs text-gray-600 dark:text-slate-400">ID: {campaign.batch_id}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-slate-100">
                          {getStatusBadge(campaign.status)}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-slate-100">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                            {campaign.leads_count}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCampaignDetails(campaign)}
                              className="hover:bg-gray-100 dark:hover:bg-slate-600"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Open in SmartLead.ai dashboard
                                window.open('https://app.smartlead.ai/app/dashboard', '_blank')
                              }}
                              className="hover:bg-gray-100 dark:hover:bg-slate-600"
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
        <DialogContent className="sm:max-w-[425px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              Create New Campaign
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new email campaign for your outreach efforts. Choose a descriptive name that helps you identify the campaign purpose.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="campaign-name" className="text-foreground">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g., Q1 2024 SaaS Prospects"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCampaignName.trim()) {
                    handleCreateCampaign()
                  }
                }}
                className="col-span-3 bg-background border-border text-foreground placeholder:text-muted-foreground"
                disabled={actionLoading === 'create'}
              />
              {newCampaignName.trim() && (
                <p className="text-xs text-muted-foreground">
                  Campaign will be created with name: "{newCampaignName.trim()}"
                </p>
              )}
            </div>
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
              disabled={!newCampaignName.trim() || actionLoading === 'create'}
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
                      {selectedCampaign.subject || 'No subject set'}
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
                      {selectedCampaign.platform || 'SmartLead.ai'}
                      {selectedCampaign.ai_personalized && (
                        <span className="ml-2 text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">
                          AI Enhanced
                        </span>
                      )}
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
                      {selectedCampaign.target_count || selectedCampaign.leads_count || 0}
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
                      {selectedCampaign.type === 'ai_personalized' ? 'AI Personalized' : 
                       selectedCampaign.type === 'email_outreach' ? 'Email Outreach' : 
                       selectedCampaign.type || 'Standard Campaign'}
                    </p>
                  </div>
                  {selectedCampaign.ai_personalized && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        AI Personalization Level
                      </Label>
                      <p className="text-gray-900 dark:text-slate-100 mt-1 capitalize">
                        {selectedCampaign.personalization_level || 'High'}
                      </p>
                    </div>
                  )}
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

              {/* SmartLead.ai Features */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                      SmartLead.ai Enhanced Features
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                      Your campaigns now leverage SmartLead.ai's AI-powered features:
                    </p>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>• AI-powered email personalization and optimization</li>
                      <li>• Advanced deliverability and spam prevention</li>
                      <li>• Smart send time optimization</li>
                      <li>• Real-time engagement tracking and analytics</li>
                      <li>• Automated follow-up sequences</li>
                      <li>• Integrated CRM and lead management</li>
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
            <Button variant="outline" onClick={closeCampaignDetails} className="bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border-gray-300 dark:border-slate-600">
              Close
            </Button>
            <Button 
              onClick={() => {
                // Open in SmartLead.ai dashboard
                window.open('https://app.smartlead.ai/app/dashboard', '_blank')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in SmartLead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
