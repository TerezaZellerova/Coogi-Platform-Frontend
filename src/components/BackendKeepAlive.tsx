'use client'

import { useEffect } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://coogi-backend.onrender.com'

export function BackendKeepAlive() {
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const pingBackend = async () => {
      try {
        const startTime = Date.now()
        const response = await fetch(`${BACKEND_URL}/`, {
          method: 'GET',
          cache: 'no-store'
        })
        const endTime = Date.now()
        const responseTime = endTime - startTime

        if (response.ok) {
          console.log(`🏃 Backend keep-alive: ${responseTime}ms`)
        } else {
          console.warn(`⚠️  Backend keep-alive failed: ${response.status}`)
        }
      } catch (error) {
        console.error('❌ Backend keep-alive error:', error)
      }
    }

    // Ping immediately on mount
    pingBackend()

    // Then ping every 8 minutes (480 seconds)
    // This prevents the 10-minute sleep timeout
    intervalId = setInterval(pingBackend, 8 * 60 * 1000)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [])

  return null // This component doesn't render anything
}

export default BackendKeepAlive
