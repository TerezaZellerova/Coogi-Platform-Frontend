'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'stage_complete'
  title: string
  message: string
  duration?: number // in milliseconds, 0 for persistent
  agentId?: string
}

interface NotificationSystemProps {
  notifications: Notification[]
  onDismissAction: (id: string) => void
}

export function NotificationSystem({ notifications, onDismissAction }: NotificationSystemProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([])

  useEffect(() => {
    // Auto-dismiss notifications after their duration
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          onDismissAction(notification.id)
        }, notification.duration)

        return () => clearTimeout(timer)
      }
    })
  }, [notifications, onDismissAction])

  useEffect(() => {
    // Animate in new notifications
    const newNotifications = notifications
      .filter(n => !visibleNotifications.includes(n.id))
      .map(n => n.id)
    
    if (newNotifications.length > 0) {
      setTimeout(() => {
        setVisibleNotifications(prev => [...prev, ...newNotifications])
      }, 100)
    }

    // Remove dismissed notifications from visible list
    setVisibleNotifications(prev => 
      prev.filter(id => notifications.some(n => n.id === id))
    )
  }, [notifications])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-white" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 dark:text-white" />
      case 'stage_complete':
        return <Zap className="h-5 w-5 text-blue-500 dark:text-white" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500 dark:text-white" />
    }
  }

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-800 dark:border-green-500 dark:text-white'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-800 dark:border-red-500 dark:text-white'
      case 'stage_complete':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-800 dark:border-blue-500 dark:text-white'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-800 dark:border-blue-500 dark:text-white'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            transform transition-all duration-300 ease-in-out
            ${visibleNotifications.includes(notification.id) 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0'
            }
            ${getNotificationStyles(notification.type)}
            border rounded-lg p-4 shadow-lg backdrop-blur-sm dark:shadow-2xl dark:shadow-black/50
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              <p className="text-xs mt-1 opacity-90">{notification.message}</p>
              {notification.agentId && (
                <p className="text-xs mt-1 opacity-75 font-mono">
                  Agent: {notification.agentId.slice(0, 8)}...
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismissAction(notification.id)}
              className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/20 dark:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000 // Default 5 seconds
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    return id
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Helper methods for common notification types
  const notifySuccess = useCallback((title: string, message: string, agentId?: string) => {
    return addNotification({ type: 'success', title, message, agentId })
  }, [addNotification])

  const notifyError = useCallback((title: string, message: string, agentId?: string) => {
    return addNotification({ type: 'error', title, message, agentId, duration: 8000 })
  }, [addNotification])

  const notifyStageComplete = useCallback((title: string, message: string, agentId?: string) => {
    return addNotification({ type: 'stage_complete', title, message, agentId })
  }, [addNotification])

  const notifyInfo = useCallback((title: string, message: string, agentId?: string) => {
    return addNotification({ type: 'info', title, message, agentId })
  }, [addNotification])

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    notifySuccess,
    notifyError,
    notifyStageComplete,
    notifyInfo
  }
}
