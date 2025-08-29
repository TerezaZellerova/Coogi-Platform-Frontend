'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  CreditCard, 
  Crown, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Star,
  Gift,
  ArrowUpCircle
} from 'lucide-react'
import PaymentMethods from './PaymentMethodsModal'

// Mock data - replace with real API calls
const mockSubscription = {
  plan: 'Pro',
  status: 'active',
  billingCycle: 'monthly',
  price: 29,
  nextBilling: '2024-02-15',
  daysLeft: 12,
  features: {
    agents: { used: 3, limit: 10 },
    searches: { used: 1250, limit: 5000 },
    emails: { used: 340, limit: 1000 },
    campaigns: { used: 2, limit: 5 }
  }
}

const mockBillingHistory = [
  { id: '1', date: '2024-01-15', amount: 29, status: 'paid', plan: 'Pro Monthly' },
  { id: '2', date: '2023-12-15', amount: 29, status: 'paid', plan: 'Pro Monthly' },
  { id: '3', date: '2023-11-15', amount: 29, status: 'paid', plan: 'Pro Monthly' },
  { id: '4', date: '2023-10-15', amount: 0, status: 'trial', plan: 'Free Trial' }
]

const planTiers = [
  {
    name: 'Starter',
    price: 19,
    popular: false,
    features: {
      agents: 5,
      searches: 2500,
      emails: 500,
      campaigns: 3,
      support: 'Email',
      analytics: 'Basic'
    }
  },
  {
    name: 'Pro',
    price: 29,
    popular: true,
    features: {
      agents: 10,
      searches: 5000,
      emails: 1000,
      campaigns: 5,
      support: 'Priority',
      analytics: 'Advanced'
    }
  },
  {
    name: 'Business',
    price: 49,
    popular: false,
    features: {
      agents: 25,
      searches: 12500,
      emails: 2500,
      campaigns: 15,
      support: 'Phone & Email',
      analytics: 'Enterprise'
    }
  },
  {
    name: 'Enterprise',
    price: 99,
    popular: false,
    features: {
      agents: 'Unlimited',
      searches: 'Unlimited',
      emails: 'Unlimited',
      campaigns: 'Unlimited',
      support: 'Dedicated Manager',
      analytics: 'Custom'
    }
  }
]

export default function SubscriptionDashboard() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName)
    setShowPaymentModal(true)
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400'
    if (percentage >= 75) return 'text-amber-600 dark:text-amber-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  return (
    <div className="space-y-8">
      {/* Current Plan Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {mockSubscription.plan} Plan
                  </CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">
                    ${mockSubscription.price}/month • Next billing in {mockSubscription.daysLeft} days
                  </CardDescription>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {mockSubscription.features.agents.used}/{mockSubscription.features.agents.limit}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Active Agents</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {mockSubscription.features.searches.used.toLocaleString()}/{mockSubscription.features.searches.limit.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Monthly Searches</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
              Usage This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Searches</span>
                <span className={`text-sm font-bold ${getUsageColor(getUsagePercentage(mockSubscription.features.searches.used, mockSubscription.features.searches.limit))}`}>
                  {mockSubscription.features.searches.used.toLocaleString()}/{mockSubscription.features.searches.limit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(mockSubscription.features.searches.used, mockSubscription.features.searches.limit)} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Emails</span>
                <span className={`text-sm font-bold ${getUsageColor(getUsagePercentage(mockSubscription.features.emails.used, mockSubscription.features.emails.limit))}`}>
                  {mockSubscription.features.emails.used}/{mockSubscription.features.emails.limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(mockSubscription.features.emails.used, mockSubscription.features.emails.limit)} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Campaigns</span>
                <span className={`text-sm font-bold ${getUsageColor(getUsagePercentage(mockSubscription.features.campaigns.used, mockSubscription.features.campaigns.limit))}`}>
                  {mockSubscription.features.campaigns.used}/{mockSubscription.features.campaigns.limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(mockSubscription.features.campaigns.used, mockSubscription.features.campaigns.limit)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">Usage Overview</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg">Billing History</TabsTrigger>
          <TabsTrigger value="upgrade" className="rounded-lg">Upgrade Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Usage Warning Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getUsagePercentage(mockSubscription.features.searches.used, mockSubscription.features.searches.limit) >= 75 && (
              <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <div className="font-semibold text-amber-900 dark:text-amber-100">
                        Search Limit Warning
                      </div>
                      <div className="text-sm text-amber-700 dark:text-amber-300">
                        You've used {Math.round(getUsagePercentage(mockSubscription.features.searches.used, mockSubscription.features.searches.limit))}% of your monthly searches
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                      Upgrade Available
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">
                      Get 2x more searches with Business plan
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Usage Statistics</CardTitle>
              <CardDescription>Track your monthly consumption across all features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      Active Agents
                    </span>
                    <span className="text-sm font-bold">
                      {mockSubscription.features.agents.used}/{mockSubscription.features.agents.limit}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(mockSubscription.features.agents.used, mockSubscription.features.agents.limit)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-amber-500" />
                      Searches
                    </span>
                    <span className="text-sm font-bold">
                      {mockSubscription.features.searches.used.toLocaleString()}/{mockSubscription.features.searches.limit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(mockSubscription.features.searches.used, mockSubscription.features.searches.limit)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-emerald-500" />
                      Emails
                    </span>
                    <span className="text-sm font-bold">
                      {mockSubscription.features.emails.used}/{mockSubscription.features.emails.limit}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(mockSubscription.features.emails.used, mockSubscription.features.emails.limit)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                      Campaigns
                    </span>
                    <span className="text-sm font-bold">
                      {mockSubscription.features.campaigns.used}/{mockSubscription.features.campaigns.limit}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(mockSubscription.features.campaigns.used, mockSubscription.features.campaigns.limit)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Billing History
              </CardTitle>
              <CardDescription>View your payment history and download invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBillingHistory.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.plan}</TableCell>
                      <TableCell>
                        {invoice.amount === 0 ? 'Free' : `$${invoice.amount}`}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={invoice.status === 'paid' ? 'default' : invoice.status === 'trial' ? 'secondary' : 'destructive'}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.status === 'paid' && (
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Upgrade Your Plan
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Scale your lead generation with more powerful features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {planTiers.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative border-2 transition-all duration-200 hover:shadow-lg ${
                  plan.popular 
                    ? 'border-blue-500 shadow-blue-100 dark:shadow-blue-900/20' 
                    : plan.name === mockSubscription.plan
                    ? 'border-emerald-500 shadow-emerald-100 dark:shadow-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {plan.name === mockSubscription.plan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white px-3 py-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    ${plan.price}
                    <span className="text-sm font-normal text-slate-600 dark:text-slate-400">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Agents</span>
                      <span className="font-semibold">{plan.features.agents}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Searches</span>
                      <span className="font-semibold">
                        {typeof plan.features.searches === 'number' 
                          ? plan.features.searches.toLocaleString() 
                          : plan.features.searches}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Email Exports</span>
                      <span className="font-semibold">
                        {typeof plan.features.emails === 'number' 
                          ? plan.features.emails.toLocaleString() 
                          : plan.features.emails}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Campaigns</span>
                      <span className="font-semibold">{plan.features.campaigns}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Support</span>
                      <span className="font-semibold">{plan.features.support}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-6"
                    variant={plan.name === mockSubscription.plan ? "outline" : "default"}
                    disabled={plan.name === mockSubscription.plan}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {plan.name === mockSubscription.plan ? (
                      'Current Plan'
                    ) : (
                      <>
                        <ArrowUpCircle className="w-4 h-4 mr-2" />
                        Upgrade to {plan.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentMethods 
          selectedPlan={selectedPlan}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  )
}
