'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, type Agent, type AgentLog, type AgentStatus } from '@/lib/api-production'
import { useToast } from '@/components/ui/toast'

interface UseAgentMonitoringOptions {
  enabled?: boolean
  interval?: number // in milliseconds
  onStatusChange?: (agent: Agent, status: AgentStatus) => void
  onNewLogs?: (agent: Agent, logs: AgentLog[]) => void
}

interface AgentMonitoringState {
  agents: Map<string, Agent>
  logs: Map<string, AgentLog[]>
  statuses: Map<string, AgentStatus>
  loading: boolean
  error: string | null
}

export function useAgentMonitoring(options: UseAgentMonitoringOptions = {}) {
  const {
    enabled = true,
    interval = 5000, // 5 seconds like HTML templates
    onStatusChange,
    onNewLogs
  } = options

  const { addToast } = useToast()
  const [state, setState] = useState<AgentMonitoringState>({
    agents: new Map(),
    logs: new Map(),
    statuses: new Map(),
    loading: false,
    error: null
  })

  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const lastLogCountRef = useRef<Map<string, number>>(new Map())

  // Add agent to monitoring
  const addAgent = useCallback((agent: Agent) => {
    setState(prev => {
      const newAgents = new Map(prev.agents)
      newAgents.set(agent.batch_id || agent.id, agent)
      return { ...prev, agents: newAgents }
    })

    // Start monitoring for this specific agent
    if (enabled && agent.batch_id) {
      startAgentMonitoring(agent.batch_id, agent)
    }
  }, [enabled])

  // Remove agent from monitoring
  const removeAgent = useCallback((agentId: string) => {
    setState(prev => {
      const newAgents = new Map(prev.agents)
      const newLogs = new Map(prev.logs)
      const newStatuses = new Map(prev.statuses)
      
      newAgents.delete(agentId)
      newLogs.delete(agentId)
      newStatuses.delete(agentId)
      
      return {
        ...prev,
        agents: newAgents,
        logs: newLogs,
        statuses: newStatuses
      }
    })

    // Stop monitoring
    stopAgentMonitoring(agentId)
  }, [])

  // Start monitoring for specific agent
  const startAgentMonitoring = useCallback((batchId: string, agent: Agent) => {
    // Clear existing interval if any
    const existingInterval = intervalsRef.current.get(batchId)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // Start new monitoring interval
    const intervalId = setInterval(async () => {
      try {
        // Fetch both status and logs in parallel
        const [status, logs] = await Promise.all([
          apiClient.getAgentStatus(batchId),
          apiClient.getAgentLogs(batchId)
        ])

        setState(prev => {
          const newStatuses = new Map(prev.statuses)
          const newLogs = new Map(prev.logs)
          
          // Update status
          const oldStatus = newStatuses.get(batchId)
          newStatuses.set(batchId, status)
          
          // Update logs
          const oldLogs = newLogs.get(batchId) || []
          newLogs.set(batchId, logs)
          
          // Check for new logs
          const oldLogCount = lastLogCountRef.current.get(batchId) || 0
          if (logs.length > oldLogCount) {
            lastLogCountRef.current.set(batchId, logs.length)
            const newLogsOnly = logs.slice(oldLogCount)
            
            // Show toast for important log entries
            newLogsOnly.forEach(log => {
              if (log.level === 'error') {
                addToast({
                  type: 'error',
                  title: `Agent ${batchId}`,
                  message: log.message,
                  duration: 7000
                })
              } else if (log.level === 'success' && log.message.includes('completed')) {
                addToast({
                  type: 'success',
                  title: `Agent ${batchId}`,
                  message: log.message,
                  duration: 5000
                })
              }
            })
            
            // Call callback if provided
            if (onNewLogs) {
              onNewLogs(agent, newLogsOnly)
            }
          }
          
          // Check for status changes
          if (oldStatus && oldStatus.status !== status.status) {
            addToast({
              type: status.status === 'completed' ? 'success' : 
                    status.status === 'failed' ? 'error' : 'info',
              title: `Agent ${batchId}`,
              message: `Status changed to ${status.status}`,
              duration: 4000
            })
            
            if (onStatusChange) {
              onStatusChange(agent, status)
            }
          }
          
          return {
            ...prev,
            statuses: newStatuses,
            logs: newLogs
          }
        })

        // Stop monitoring if agent is completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          stopAgentMonitoring(batchId)
        }

      } catch (error) {
        console.error(`Error monitoring agent ${batchId}:`, error)
        setState(prev => ({
          ...prev,
          error: `Failed to monitor agent ${batchId}`
        }))
      }
    }, interval)

    intervalsRef.current.set(batchId, intervalId)
  }, [interval, onStatusChange, onNewLogs, addToast])

  // Stop monitoring for specific agent
  const stopAgentMonitoring = useCallback((batchId: string) => {
    const intervalId = intervalsRef.current.get(batchId)
    if (intervalId) {
      clearInterval(intervalId)
      intervalsRef.current.delete(batchId)
    }
  }, [])

  // Stop all monitoring
  const stopAllMonitoring = useCallback(() => {
    intervalsRef.current.forEach(intervalId => clearInterval(intervalId))
    intervalsRef.current.clear()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllMonitoring()
    }
  }, [stopAllMonitoring])

  // Pause/resume monitoring based on enabled flag
  useEffect(() => {
    if (!enabled) {
      stopAllMonitoring()
    } else {
      // Restart monitoring for all agents
      state.agents.forEach((agent, batchId) => {
        if (agent.status === 'running' || agent.status === 'processing') {
          startAgentMonitoring(batchId, agent)
        }
      })
    }
  }, [enabled, startAgentMonitoring, stopAllMonitoring, state.agents])

  return {
    agents: Array.from(state.agents.values()),
    logs: state.logs,
    statuses: state.statuses,
    loading: state.loading,
    error: state.error,
    addAgent,
    removeAgent,
    startAgentMonitoring,
    stopAgentMonitoring,
    stopAllMonitoring
  }
}
