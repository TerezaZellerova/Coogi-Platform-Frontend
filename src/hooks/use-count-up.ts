'use client'

import { useEffect, useState } from 'react'

export function useCountUp(end: number, duration: number = 2000, delay: number = 0) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return

    const startTime = Date.now() + delay
    const startValue = 0

    const updateCount = () => {
      const now = Date.now()
      const elapsed = now - startTime

      if (elapsed < 0) {
        requestAnimationFrame(updateCount)
        return
      }

      if (elapsed < duration) {
        const progress = elapsed / duration
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentCount = Math.round(startValue + (end - startValue) * easeOutQuart)
        setCount(currentCount)
        requestAnimationFrame(updateCount)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(updateCount)
  }, [end, duration, delay, hasStarted])

  const start = () => setHasStarted(true)
  const reset = () => {
    setHasStarted(false)
    setCount(0)
  }

  return { count, start, reset, hasStarted }
}
