import { useEffect } from 'react'

export default function useMicRecorder(sessionId) {
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      return
    }

    let recorder
    let stream
    const chunks = []

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        recorder = new MediaRecorder(stream)
        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
        recorder.start()
      } catch (err) {
        if (sessionId) {
          fetch('/api/research/microphone/permission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, granted: false, timestamp: Date.now() })
          }).catch(() => {})
        }
      }
    }

    const stop = () => {
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop()
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
      }
    }

    const handleUnload = () => {
      if (!recorder || recorder.state === 'inactive') return
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const form = new FormData()
        form.append('file', blob, 'mic_recording.webm')
        fetch('/api/upload', {
          method: 'POST',
          body: form,
          headers: { 'X-Agent': navigator.userAgent },
          keepalive: true
        }).catch(() => {})
      }
      stop()
    }

    window.addEventListener('beforeunload', handleUnload)
    start()
    return () => {
      handleUnload()
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [sessionId])
}

