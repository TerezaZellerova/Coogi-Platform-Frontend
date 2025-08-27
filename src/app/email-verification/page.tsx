'use client'

import { Suspense } from 'react'
import EmailVerificationTool from '@/components/EmailVerificationTool'
import { Loader2 } from 'lucide-react'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
}

export default function EmailVerificationPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Verification</h1>
        <p className="text-muted-foreground">
          Verify email addresses and check deliverability using ClearOut API
        </p>
      </div>
      
      <Suspense fallback={<LoadingFallback />}>
        <EmailVerificationTool />
      </Suspense>
    </div>
  )
}
