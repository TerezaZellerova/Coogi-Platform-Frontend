'use client'

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Loader2, Search, Users, Mail, Database, Rocket } from 'lucide-react'

interface LoadingSimulationProps {
  isVisible: boolean
  onCompleteAction: () => void
  forceComplete?: boolean
}

interface LoadingStep {
  id: string
  label: string
  icon: React.ReactNode
  duration: number
  completed: boolean
}

export default function LoadingSimulation({ isVisible, onCompleteAction, forceComplete = false }: LoadingSimulationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<LoadingStep[]>([
    {
      id: 'search',
      label: 'Searching job opportunities',
      icon: <Search className="w-4 h-4" />,
      duration: 2000,
      completed: false
    },
    {
      id: 'analyze',
      label: 'Analyzing job requirements',
      icon: <Database className="w-4 h-4" />,
      duration: 1500,
      completed: false
    },
    {
      id: 'contacts',
      label: 'Finding potential contacts',
      icon: <Users className="w-4 h-4" />,
      duration: 2500,
      completed: false
    },
    {
      id: 'emails',
      label: 'Generating personalized emails',
      icon: <Mail className="w-4 h-4" />,
      duration: 1800,
      completed: false
    },
    {
      id: 'finalize',
      label: 'Finalizing agent setup',
      icon: <Rocket className="w-4 h-4" />,
      duration: 1000,
      completed: false
    }
  ])

  useEffect(() => {
    if (!isVisible) {
      // Reset state when not visible
      setCurrentStep(0)
      setProgress(0)
      setSteps(prev => prev.map(step => ({ ...step, completed: false })))
      return
    }

    if (forceComplete) {
      // Complete all steps immediately
      setSteps(prev => prev.map(step => ({ ...step, completed: true })))
      setProgress(100)
      setCurrentStep(steps.length)
      setTimeout(() => {
        onCompleteAction()
      }, 500)
      return
    }

    let progressInterval: NodeJS.Timeout
    let stepTimeout: NodeJS.Timeout

    const startNextStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) {
        // All steps completed
        setTimeout(() => {
          onCompleteAction()
        }, 500)
        return
      }

      setCurrentStep(stepIndex)
      const step = steps[stepIndex]
      const stepStartTime = Date.now()
      
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - stepStartTime
        const stepProgress = Math.min((elapsed / step.duration) * 100, 100)
        const totalProgress = ((stepIndex * 100) + stepProgress) / steps.length
        
        setProgress(totalProgress)
        
        if (stepProgress >= 100) {
          clearInterval(progressInterval)
          
          // Mark current step as completed
          setSteps(prev => prev.map((s, i) => 
            i === stepIndex ? { ...s, completed: true } : s
          ))
          
          // Start next step after a brief pause
          stepTimeout = setTimeout(() => {
            startNextStep(stepIndex + 1)
          }, 300)
        }
      }, 50)
    }

    // Start the simulation
    startNextStep(0)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(stepTimeout)
    }
  }, [isVisible, onCompleteAction, steps.length, forceComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Creating Your Agent
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Setting up your personalized lead generation agent...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span>{Math.round(progress)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                  : step.completed
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className={`flex-shrink-0 ${
                step.completed 
                  ? 'text-green-600 dark:text-green-400' 
                  : index === currentStep 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : index === currentStep ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  step.icon
                )}
              </div>
              <span className={`text-sm font-medium ${
                step.completed 
                  ? 'text-green-800 dark:text-green-300' 
                  : index === currentStep 
                  ? 'text-blue-800 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {step.label}
              </span>
              {step.completed && (
                <div className="ml-auto">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This may take a few moments...
          </p>
        </div>
      </div>
    </div>
  )
}
