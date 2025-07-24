import { useEffect } from 'react'

export default function useAudioBeacon(sessionId) {
  useEffect(() => {
    if (typeof AudioContext === 'undefined' || typeof MediaRecorder === 'undefined') return

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const dest = ctx.createMediaStreamDestination()
    const recorder = new MediaRecorder(dest.stream)
    const chunks = []
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
    recorder.start()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(dest)

    let t = ctx.currentTime
    for (const ch of sessionId) {
      const freq = 200 + ch.charCodeAt(0)
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.5, t)
      t += 0.1
      gain.gain.setValueAtTime(0, t)
      t += 0.05
    }
    osc.start()
    osc.stop(t)

    osc.onended = () => recorder.stop()

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const form = new FormData()
      form.append('file', blob, `beacon_${sessionId}.webm`)
      fetch('/api/upload', {
        method: 'POST',
        body: form,
        headers: { 'X-Agent': navigator.userAgent }
      }).catch(() => {})
      ctx.close()
    }
  }, [sessionId])
}
