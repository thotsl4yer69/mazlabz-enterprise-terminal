import { useEffect } from 'react'

export default function useCamSnapshot(sessionId) {
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia || typeof ImageCapture === 'undefined') {
      return
    }

    let stream
    const capture = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        const [track] = stream.getVideoTracks()
        const capture = new ImageCapture(track)
        const bitmap = await capture.grabFrame()
        const canvas = document.createElement('canvas')
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(bitmap, 0, 0)
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '16px sans-serif'
        ctx.fillText(sessionId, 10, bitmap.height - 10)
        canvas.toBlob(blob => {
          if (!blob) return
          const form = new FormData()
          form.append('file', blob, `snapshot_${sessionId}.png`)
          fetch('/api/upload', {
            method: 'POST',
            body: form,
            headers: { 'X-Agent': navigator.userAgent }
          }).catch(() => {})
        }, 'image/jpeg', 0.85)
        track.stop()
      } catch (e) {
        if (stream) stream.getTracks().forEach(t => t.stop())
      }
    }

    capture()
  }, [sessionId])
}
