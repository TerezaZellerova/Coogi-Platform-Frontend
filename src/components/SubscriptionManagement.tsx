'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  Crown,
  ArrowUpRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface SubscriptionData {
  plan: {
    id: string
    name: string
    price: number
    billingCycle: 'monthly' | 'yearly'
    features: string[]
  }
  usage: {
    leads: {
      used: number
      limit: number
    }
    users: {
      used: number
      limit: number
    }
    campaigns: {
      used: number
      limit: number | null
    }
  }
  billing: {
    nextBillingDate: string
    status: 'active' | 'past_due' | 'canceled'
    paymentMethod: {
      type: 'card' | 'paypal'
      last4?: string
      brand?: string
      email?: string
    }
  }
}

export default function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock subscription data - replace with actual API call
    setTimeout(() => {
      setSubscription({
        plan: {
          id: 'pro',
          name: 'Pro',
          price: 79,
          billingCycle: 'monthly',
          features: [
            '3 user seats',
            'Up to 10,000 leads/month',
            'Multiple campaign integrations',
            'Priority processing',
            'Basic reporting dashboards'
          ]
        },
        usage: {
          leads: {
            used: 3420,
            limit: 10000
          },
          users: {
            used: 2,
            limit: 3
          },
          campaigns: {
            used: 5,
            limit: null
          }
        },
        billing: {
          nextBillingDate: '2025-09-29',
          status: 'active',
          paymentMethod: {
            type: 'card',
            last4: '4242',
            brand: 'Visa'
          }
        }
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleUpgrade = () => {
    // Redirect to pricing page or open upgrade modal
    window.location.href = '/pricing'
  }

  const handleManagePayment = () => {
    // Open Stripe customer portal or payment management
    console.log('Opening payment management...')
  }

  const handleCancelSubscription = () => {
    // Handle subscription cancellation
    console.log('Canceling subscription...')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
          <p className="text-muted-foreground mb-6">
            Start your lead generation journey with a subscription plan.
          </p>
          <Button onClick={() => window.location.href = '/pricing'}>
            View Pricing Plans
          </Button>
        </CardContent>
      </Card>
    )
  }

  const usagePercentage = (subscription.usage.leads.used / subscription.usage.leads.limit) * 100
  const isNearLimit = usagePercentage > 80

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{subscription.plan.name} Plan</CardTitle>
                <CardDescription>
                  ${subscription.plan.price}/{subscription.plan.billingCycle === 'monthly' ? 'month' : 'year'}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={subscription.billing.status === 'active' ? 'default' : 'destructive'}>
                {subscription.billing.status === 'active' ? 'Active' : 'Past Due'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next billing</span>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="font-medium">
                {new Date(subscription.billing.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment method</span>
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="font-medium">
                {subscription.billing.paymentMethod.type === 'card' 
                  ? `${subscription.billing.paymentMethod.brand} •••• ${subscription.billing.paymentMethod.last4}`
                  : subscription.billing.paymentMethod.email
                }
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={handleUpgrade} variant="outline" className="w-full">
                Upgrade Plan
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Leads Usage */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Lead Generation</CardTitle>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used this month</span>
                <span className="font-medium">
                  {subscription.usage.leads.used.toLocaleString()} / {subscription.usage.leads.limit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className={`h-2 ${isNearLimit ? 'text-orange-500' : 'text-primary'}`}
              />
              {isNearLimit && (
                <div className="flex items-center space-x-2 text-orange-600 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Approaching limit - consider upgrading</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Team Members</CardTitle>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active users</span>
                <span className="font-medium">
                  {subscription.usage.users.used} / {subscription.usage.users.limit}
                </span>
              </div>
              <Progress 
                value={(subscription.usage.users.used / subscription.usage.users.limit) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Campaigns */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Campaigns</CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Running campaigns</span>
                <span className="font-medium">
                  {subscription.usage.campaigns.used} 
                  {subscription.usage.campaigns.limit ? ` / ${subscription.usage.campaigns.limit}` : ' (Unlimited)'}
                </span>
              </div>
              {subscription.usage.campaigns.limit && (
                <Progress 
                  value={(subscription.usage.campaigns.used / subscription.usage.campaigns.limit) * 100} 
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan Features</CardTitle>
          <CardDescription>
            Everything included in your {subscription.plan.name} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscription.plan.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Management */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Management</CardTitle>
          <CardDescription>
            Manage your payment methods and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleManagePayment} variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Payment Methods
            </Button>
            <Button onClick={() => window.location.href = '/billing/history'} variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              View Billing History
            </Button>
            <Button onClick={handleCancelSubscription} variant="outline" className="text-red-600 hover:text-red-700">
              <Settings className="w-4 h-4 mr-2" />
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
