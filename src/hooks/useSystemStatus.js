import { useState, useEffect } from 'react'

export default function useSystemStatus(fileCount) {
  const [status, setStatus] = useState({ cpu: 0, memory: 0, files: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus({
        cpu: Math.floor(Math.random() * 40) + 10,
        memory: Math.floor(Math.random() * 20) + 40,
        files: fileCount
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [fileCount])

  return status
}
