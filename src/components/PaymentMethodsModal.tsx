'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Shield, 
  Lock, 
  Check,
  Loader2,
  X
} from 'lucide-react'

// Plan data mapping
const planData = {
  'Starter': { id: 'starter', name: 'Starter', price: 19, billingCycle: 'monthly' as const },
  'Pro': { id: 'pro', name: 'Pro', price: 29, billingCycle: 'monthly' as const },
  'Business': { id: 'business', name: 'Business', price: 49, billingCycle: 'monthly' as const },
  'Enterprise': { id: 'enterprise', name: 'Enterprise', price: 99, billingCycle: 'monthly' as const }
}

interface PaymentMethodsProps {
  selectedPlan: string
  onClose?: () => void
}

export default function PaymentMethods({ selectedPlan, onClose }: PaymentMethodsProps) {
  const [loading, setLoading] = useState<'stripe' | 'paypal' | null>(null)
  
  const plan = planData[selectedPlan as keyof typeof planData]
  
  if (!plan) {
    return null
  }

  const handleStripePayment = async () => {
    setLoading('stripe')
    try {
      // Mock API call - replace with real Stripe integration
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Stripe payment initiated for:', plan)
      // Redirect would happen here in real implementation
    } catch (error) {
      console.error('Stripe payment error:', error)
    } finally {
      setLoading(null)
    }
  }

  const handlePayPalPayment = async () => {
    setLoading('paypal')
    try {
      // Mock API call - replace with real PayPal integration
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('PayPal payment initiated for:', plan)
      // Redirect would happen here in real implementation
    } catch (error) {
      console.error('PayPal payment error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Complete Your Subscription</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-slate-600 dark:text-slate-400">{plan.name} Plan</span>
                  <Badge variant="secondary" className="text-xs">
                    Monthly
                  </Badge>
                </div>
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription className="mt-4">
            You're about to subscribe to the {plan.name} plan
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Plan Summary */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <span className="font-medium">Plan Total</span>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                    /month
                  </span>
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">
                  14-day free trial included
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
            
            {/* Stripe Payment */}
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-blue-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold">Credit/Debit Card</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Visa, Mastercard, American Express
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleStripePayment}
                    disabled={!!loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading === 'stripe' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Pay with Card'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PayPal Payment */}
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-[#0070ba]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#0070ba]/10 rounded-lg">
                      <div className="w-5 h-5 bg-[#0070ba] rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">PayPal</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Pay with your PayPal account
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handlePayPalPayment}
                    disabled={!!loading}
                    className="bg-[#0070ba] hover:bg-[#005ea6] text-white"
                  >
                    {loading === 'paypal' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Pay with PayPal'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                  Secure Payment
                </div>
                <div className="text-emerald-700 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-3 h-3" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3 h-3" />
                    <span>PCI DSS compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3 h-3" />
                    <span>Cancel anytime, no hidden fees</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="text-xs text-slate-600 dark:text-slate-400 text-center border-t pt-4">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            Your subscription will automatically renew monthly.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
