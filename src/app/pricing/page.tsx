'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CoogiLogo } from '@/components/ui/coogi-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Check, 
  Star, 
  Users, 
  Zap, 
  Crown, 
  Shield,
  Sparkles
} from 'lucide-react'

const pricingTiers = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals & freelancers',
    price: 29,
    yearlyPrice: 290,
    badge: null,
    icon: Users,
    features: [
      '1 user seat',
      'Up to 2,000 leads/month',
      '1 Instantly.ai campaign integration',
      'Basic email verification',
      'Standard support',
      '14-day free trial'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Ideal for small teams & growing businesses',
    price: 79,
    yearlyPrice: 790,
    badge: 'Most Popular',
    icon: Zap,
    features: [
      '3 user seats',
      'Up to 10,000 leads/month',
      'Multiple campaign integrations',
      'Priority processing',
      'Basic reporting dashboards',
      'Email & chat support',
      'Zapier + Webhooks',
      'Custom tags & filters'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For agencies & scale-ups',
    price: 199,
    yearlyPrice: 1990,
    badge: 'Best Value',
    icon: Crown,
    features: [
      '10 user seats',
      'Up to 50,000 leads/month',
      'Unlimited campaigns',
      'Advanced features & API access',
      'Advanced analytics & CRM export',
      'Priority support',
      'Custom data pipelines',
      'Bulk upload & management',
      'White-label options'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: null,
    yearlyPrice: null,
    badge: 'Contact Sales',
    icon: Shield,
    features: [
      'Unlimited user seats',
      'Unlimited leads',
      'SLA & dedicated support',
      'Custom integrations',
      'Advanced security & compliance',
      'Dedicated account manager',
      'Multi-region deployment',
      'Custom training & onboarding'
    ],
    cta: 'Contact Sales',
    popular: false
  }
]

export default function PricingPage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handleGetStarted = (tierId: string) => {
    if (tierId === 'enterprise') {
      // Open contact form or redirect to sales
      window.open('mailto:sales@coogi.dev?subject=Enterprise Plan Inquiry', '_blank')
    } else {
      // Redirect to signup with plan parameter
      router.push(`/signup?plan=${tierId}&billing=${billingCycle}`)
    }
  }

  const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12
    const savings = monthlyTotal - yearlyPrice
    const percentage = Math.round((savings / monthlyTotal) * 100)
    return { savings, percentage }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => router.push('/landing')}
            >
              <CoogiLogo size="md" />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Badge variant="outline" className="px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              14-Day Free Trial • No Credit Card Required
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your lead generation needs. Start with a free trial and scale as you grow.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-muted p-1 rounded-xl">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon
            const isPopular = tier.popular
            const savings = tier.price && tier.yearlyPrice ? calculateSavings(tier.price, tier.yearlyPrice) : null

            return (
              <Card 
                key={tier.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isPopular 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {tier.badge && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className={`text-center py-2 text-xs font-medium ${
                      isPopular 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {tier.badge}
                    </div>
                  </div>
                )}

                <CardHeader className={`text-center ${tier.badge ? 'pt-12' : 'pt-6'}`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isPopular 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.description}</CardDescription>
                  
                  <div className="mt-6">
                    {tier.price ? (
                      <>
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold">
                            ${billingCycle === 'monthly' ? tier.price : Math.round(tier.yearlyPrice! / 12)}
                          </span>
                          <span className="text-muted-foreground ml-1">/month</span>
                        </div>
                        {billingCycle === 'yearly' && savings && (
                          <div className="text-sm text-green-600 mt-2">
                            Save ${savings.savings}/year ({savings.percentage}% off)
                          </div>
                        )}
                        {billingCycle === 'yearly' && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Billed annually (${tier.yearlyPrice})
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-3xl font-bold">Custom</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handleGetStarted(tier.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">All plans include</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Get LinkedIn leads in 2-3 minutes with our advanced AI agents</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Secure & Compliant</h3>
              <p className="text-sm text-muted-foreground">GDPR compliant with enterprise-grade security</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Get help when you need it with our dedicated support team</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8">
              <Star className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Ready to supercharge your lead generation?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of sales professionals who trust COOGI to find their next customers.
              </p>
              <Button 
                size="lg" 
                onClick={() => router.push('/signup')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
              >
                Start Your Free Trial
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
