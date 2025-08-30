'use client'

import { useState, useEffect } from 'react'
import { checkHealth } from '@/lib/api'

export function HealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkBackendHealth = async () => {
    setIsChecking(true)
    try {
      const healthy = await checkHealth()
      setIsHealthy(healthy)
    } catch (error) {
      console.error('Health check failed:', error)
      setIsHealthy(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkBackendHealth()
  }, [])

  const getStatusColor = () => {
    if (isChecking) return 'bg-yellow-500'
    if (isHealthy === null) return 'bg-gray-500'
    return isHealthy ? 'bg-green-500' : 'bg-red-500'
  }

  const getStatusText = () => {
    if (isChecking) return 'Checking...'
    if (isHealthy === null) return 'Unknown'
    return isHealthy ? 'Connected' : 'Disconnected'
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
      <span className="text-gray-600">
        Backend: {getStatusText()}
      </span>
      <button
        onClick={checkBackendHealth}
        disabled={isChecking}
        className="text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
      >
        Refresh
      </button>
    </div>
  )
}
