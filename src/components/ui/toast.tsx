'use client'

import * as React from 'react'
import { createContext, useContext, useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    
    // Prevent duplicate notifications by checking if similar toast exists
    const isDuplicate = toasts.some(existingToast => 
      existingToast.message === toast.message && 
      existingToast.type === toast.type
    )
    
    if (isDuplicate) {
      return // Don't add duplicate toast
    }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove after duration (default 4 seconds)
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 4000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastComponent({ toast }: { toast: Toast }) {
  const { removeToast } = useToast()
  const [isVisible, setIsVisible] = useState(false)

  React.useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => removeToast(toast.id), 300)
  }

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        'border rounded-lg p-4 min-w-80 max-w-96',
        'flex items-start gap-3 transition-all duration-300 pointer-events-auto',
        'transform translate-x-full opacity-0',
        'shadow-2xl',
        isVisible && 'transform translate-x-0 opacity-100',
        // SOLID dark backgrounds with high contrast
        toast.type === 'success' && 'bg-green-50 border-green-200 dark:bg-green-800 dark:border-green-500 dark:shadow-green-900/50',
        toast.type === 'error' && 'bg-red-50 border-red-200 dark:bg-red-800 dark:border-red-500 dark:shadow-red-900/50',
        toast.type === 'warning' && 'bg-yellow-50 border-yellow-200 dark:bg-yellow-800 dark:border-yellow-500 dark:shadow-yellow-900/50',
        toast.type === 'info' && 'bg-blue-50 border-blue-200 dark:bg-blue-800 dark:border-blue-500 dark:shadow-blue-900/50'
      )}
    >
      <div className={cn(
        'flex-shrink-0 w-5 h-5 mt-0.5',
        // Bright colored icons for light mode, WHITE for dark mode
        toast.type === 'success' && 'text-green-600 dark:text-white',
        toast.type === 'error' && 'text-red-600 dark:text-white',
        toast.type === 'warning' && 'text-yellow-600 dark:text-white',
        toast.type === 'info' && 'text-blue-600 dark:text-white'
      )}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className={cn(
            'font-semibold mb-1',
            // Dark text for light mode, WHITE for dark mode
            toast.type === 'success' && 'text-green-800 dark:text-white',
            toast.type === 'error' && 'text-red-800 dark:text-white',
            toast.type === 'warning' && 'text-yellow-800 dark:text-white',
            toast.type === 'info' && 'text-blue-800 dark:text-white'
          )}>
            {toast.title}
          </div>
        )}
        <div className={cn(
          'text-sm',
          // Dark text for light mode, WHITE for dark mode
          toast.type === 'success' && 'text-green-700 dark:text-white',
          toast.type === 'error' && 'text-red-700 dark:text-white',
          toast.type === 'warning' && 'text-yellow-700 dark:text-white',
          toast.type === 'info' && 'text-blue-700 dark:text-white'
        )}>
          {toast.message}
        </div>
      </div>
      
      <button
        onClick={handleRemove}
        className={cn(
          'flex-shrink-0 transition-colors rounded-sm p-1',
          // Dark button for light mode, WHITE for dark mode
          toast.type === 'success' && 'text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-white dark:hover:text-gray-200 dark:hover:bg-green-700/50',
          toast.type === 'error' && 'text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-white dark:hover:text-gray-200 dark:hover:bg-red-700/50',
          toast.type === 'warning' && 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 dark:text-white dark:hover:text-gray-200 dark:hover:bg-yellow-700/50',
          toast.type === 'info' && 'text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-white dark:hover:text-gray-200 dark:hover:bg-blue-700/50'
        )}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
