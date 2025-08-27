'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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
  Plus
} from 'lucide-react'

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadCampaigns()
  }, [])

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
    const campaignName = prompt('Enter campaign name:')
    if (!campaignName) return

    setActionLoading('create')
    try {
      const newCampaign = await apiClient.createCampaign(campaignName, [])
      setCampaigns(prev => [newCampaign, ...prev])
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const variants = {
      active: 'default',
      paused: 'secondary',
      draft: 'outline'
    }
    const colors = {
      active: 'text-green-600',
      paused: 'text-yellow-600',
      draft: 'text-gray-600'
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
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-56"></div>
              </div>
              <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
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
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                Email Campaigns
              </CardTitle>
              <CardDescription className="mt-2">
                Manage your email outreach campaigns with Instantly.ai integration • {campaigns.length} total campaigns
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadCampaigns}
                disabled={loading}
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleCreateCampaign}
                disabled={actionLoading === 'create'}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                {actionLoading === 'create' ? 'Creating...' : 'New Campaign'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {campaigns.length > 0 ? (
          <CardContent>
            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Campaigns</p>
                    <p className="text-2xl font-bold text-blue-700">{campaigns.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Active</p>
                    <p className="text-2xl font-bold text-green-700">
                      {campaigns.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Leads</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {campaigns.reduce((sum, c) => sum + c.leads_count, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Avg. Open Rate</p>
                    <p className="text-2xl font-bold text-orange-700">
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
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Reply Rate</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            {campaign.batch_id && (
                              <div className="text-xs text-gray-500">ID: {campaign.batch_id}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(campaign.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          {campaign.leads_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.open_rate ? `${campaign.open_rate}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {campaign.reply_rate ? `${campaign.reply_rate}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatDate(campaign.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // In production, this would open campaign details
                              alert('Campaign details coming soon')
                            }}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // In production, this would open in Instantly.ai
                              window.open('https://instantly.ai', '_blank')
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first email campaign to start reaching out to leads
              </p>
              <Button
                onClick={handleCreateCampaign}
                disabled={actionLoading === 'create'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {actionLoading === 'create' ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
