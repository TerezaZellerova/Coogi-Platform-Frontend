'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CoogiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  iconOnly?: boolean
}

const CoogiIcon = ({ size = 'md', className }: { size?: string; className?: string }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  return (
    <div className={cn(sizeClasses[size as keyof typeof sizeClasses], className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Hexagonal network structure */}
        <defs>
          <linearGradient id="coogiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F8EF7" />
            <stop offset="25%" stopColor="#5B9BF8" />
            <stop offset="50%" stopColor="#6BA8F9" />
            <stop offset="75%" stopColor="#7BB5FA" />
            <stop offset="100%" stopColor="#8BC2FB" />
          </linearGradient>
        </defs>
        
        {/* Main hexagon outline */}
        <path
          d="M30 25 L70 25 L85 50 L70 75 L30 75 L15 50 Z"
          stroke="url(#coogiGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Network nodes */}
        <circle cx="30" cy="25" r="4" fill="url(#coogiGradient)" />
        <circle cx="70" cy="25" r="4" fill="url(#coogiGradient)" />
        <circle cx="85" cy="50" r="4" fill="url(#coogiGradient)" />
        <circle cx="70" cy="75" r="4" fill="url(#coogiGradient)" />
        <circle cx="30" cy="75" r="4" fill="url(#coogiGradient)" />
        <circle cx="15" cy="50" r="4" fill="url(#coogiGradient)" />
        
        {/* Central connecting node */}
        <circle cx="50" cy="50" r="6" fill="url(#coogiGradient)" />
        
        {/* Internal connections */}
        <path
          d="M30 25 L50 50 L70 25"
          stroke="url(#coogiGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M85 50 L50 50 L15 50"
          stroke="url(#coogiGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M70 75 L50 50 L30 75"
          stroke="url(#coogiGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Additional connection points */}
        <circle cx="40" cy="35" r="2" fill="url(#coogiGradient)" />
        <circle cx="60" cy="35" r="2" fill="url(#coogiGradient)" />
        <circle cx="65" cy="60" r="2" fill="url(#coogiGradient)" />
        <circle cx="35" cy="60" r="2" fill="url(#coogiGradient)" />
      </svg>
    </div>
  )
}

export function CoogiLogo({ 
  size = 'md', 
  showText = true, 
  className,
  iconOnly = false 
}: CoogiLogoProps) {
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  if (iconOnly) {
    return <CoogiIcon size={size} className={className} />
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <CoogiIcon size={size} />
      {showText && (
        <span 
          className={cn(
            'font-bold tracking-tight text-foreground',
            textSizeClasses[size]
          )}
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Coogi
        </span>
      )}
    </div>
  )
}

export default CoogiLogo
