'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Search,
  Info
} from 'lucide-react'
import { apiClient } from '@/lib/api-production'
import type { EmailVerificationResult, AccountInfo } from '@/lib/clearout-api'

export default function EmailVerificationTool() {
  const [email, setEmail] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<EmailVerificationResult | null>(null)
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerifyEmail = async () => {
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    setIsVerifying(true)
    setError(null)
    setVerificationResult(null)

    try {
      const response = await apiClient.verifyEmail(email.trim())
      if (response.success) {
        setVerificationResult(response.data)
      } else {
        setError(response.error || 'Verification failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsVerifying(false)
    }
  }

  const loadAccountInfo = async () => {
    try {
      const response = await apiClient.getClearoutAccount()
      if (response.success) {
        setAccountInfo(response.data)
      }
    } catch (err) {
      console.error('Error loading account info:', err)
    }
  }

  React.useEffect(() => {
    loadAccountInfo()
  }, [])

  const getStatusBadge = (result: EmailVerificationResult) => {
    if (result.is_valid && result.is_deliverable) {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Valid</Badge>
    } else if (result.status === 'invalid') {
      return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Invalid</Badge>
    } else {
      return <Badge className="bg-yellow-500 text-white"><AlertCircle className="w-3 h-3 mr-1" />Risky</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Info */}
      {accountInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2" />
              ClearOut Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold">{accountInfo.plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Credits Remaining</p>
                <p className="font-semibold">{accountInfo.credits_remaining.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={accountInfo.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                  {accountInfo.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Verification
          </CardTitle>
          <CardDescription>
            Verify email addresses using ClearOut API for deliverability and validity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email address to verify"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleVerifyEmail()}
            />
            <Button 
              onClick={handleVerifyEmail} 
              disabled={isVerifying}
              className="px-6"
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {verificationResult && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Verification Results</span>
                  {getStatusBadge(verificationResult)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-mono">{verificationResult.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Confidence Score</p>
                    <p className="font-semibold">{verificationResult.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold">{verificationResult.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Result</p>
                    <p className="font-semibold">{verificationResult.result}</p>
                  </div>
                  {verificationResult.reason && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="font-semibold">{verificationResult.reason}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Technical Checks</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      {verificationResult.domain_valid ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className="text-sm">Domain Valid</span>
                    </div>
                    <div className="flex items-center">
                      {verificationResult.mx_found ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className="text-sm">MX Record</span>
                    </div>
                    <div className="flex items-center">
                      {verificationResult.smtp_valid ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className="text-sm">SMTP Valid</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
