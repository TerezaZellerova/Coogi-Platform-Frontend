// Debug component to verify environment variables
'use client'

import { apiClient } from '@/lib/api-production'

export default function EnvDebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_API_BASE:</strong> {process.env.NEXT_PUBLIC_API_BASE || 'NOT SET'}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'NOT SET'}</p>
        <p><strong>Detected at runtime:</strong> {typeof window !== 'undefined' ? 'Client' : 'Server'}</p>
        <p><strong>API Client Base URL:</strong> {(apiClient as any).baseUrl}</p>
        <button 
          onClick={() => console.log('API Base URL:', (apiClient as any).baseUrl)}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Log API URL to Console
        </button>
      </div>
    </div>
  )
}
