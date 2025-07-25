import { useState, useEffect } from 'react'

export default function useSystemStatus(fileCount) {
  const [status, setStatus] = useState({ cpu: 0, memory: 0, files: 0, uptime: 0 })

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/system/status')
        if (res.ok) {
          const data = await res.json()
          setStatus({
            cpu: data.cpu,
            memory: data.memory,
            uptime: data.uptime,
            files: fileCount
          })
        }
      } catch {}
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [fileCount])

  return status
}
