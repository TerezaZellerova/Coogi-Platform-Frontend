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
        'backdrop-blur-sm border rounded-lg shadow-xl p-4 min-w-80 max-w-96',
        'flex items-start gap-3 transition-all duration-300 pointer-events-auto',
        'transform translate-x-full opacity-0',
        isVisible && 'transform translate-x-0 opacity-100',
        // Dark mode friendly backgrounds
        toast.type === 'success' && 'bg-green-950/90 dark:bg-green-950/80 border-green-800/50 dark:border-green-700/30',
        toast.type === 'error' && 'bg-red-950/90 dark:bg-red-950/80 border-red-800/50 dark:border-red-700/30',
        toast.type === 'warning' && 'bg-yellow-950/90 dark:bg-yellow-950/80 border-yellow-800/50 dark:border-yellow-700/30',
        toast.type === 'info' && 'bg-blue-950/90 dark:bg-blue-950/80 border-blue-800/50 dark:border-blue-700/30'
      )}
    >
      <div className={cn(
        'flex-shrink-0 w-5 h-5 mt-0.5',
        toast.type === 'success' && 'text-green-400 dark:text-green-300',
        toast.type === 'error' && 'text-red-400 dark:text-red-300',
        toast.type === 'warning' && 'text-yellow-400 dark:text-yellow-300',
        toast.type === 'info' && 'text-blue-400 dark:text-blue-300'
      )}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className={cn(
            'font-semibold mb-1',
            toast.type === 'success' && 'text-green-100 dark:text-green-50',
            toast.type === 'error' && 'text-red-100 dark:text-red-50',
            toast.type === 'warning' && 'text-yellow-100 dark:text-yellow-50',
            toast.type === 'info' && 'text-blue-100 dark:text-blue-50'
          )}>
            {toast.title}
          </div>
        )}
        <div className={cn(
          'text-sm',
          toast.type === 'success' && 'text-green-200 dark:text-green-100',
          toast.type === 'error' && 'text-red-200 dark:text-red-100',
          toast.type === 'warning' && 'text-yellow-200 dark:text-yellow-100',
          toast.type === 'info' && 'text-blue-200 dark:text-blue-100'
        )}>
          {toast.message}
        </div>
      </div>
      
      <button
        onClick={handleRemove}
        className={cn(
          'flex-shrink-0 transition-colors rounded-sm p-1 hover:bg-white/10',
          toast.type === 'success' && 'text-green-300 hover:text-green-100',
          toast.type === 'error' && 'text-red-300 hover:text-red-100',
          toast.type === 'warning' && 'text-yellow-300 hover:text-yellow-100',
          toast.type === 'info' && 'text-blue-300 hover:text-blue-100'
        )}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
