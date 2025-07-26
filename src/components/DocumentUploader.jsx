// Updated DocumentUploader that uploads files to the FastAPI backend.
import React, { useState, useRef } from 'react'

const DocumentUploader = ({ onClose, onUpload }) => {
  const [uploadStep, setUploadStep] = useState('selection') // selection, uploading, success
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  // Supported document types
  const supportedTypes = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx'
  }

  const handleFileSelection = () => {
    // Trigger file input
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter(file =>
      Object.keys(supportedTypes).includes(file.type) ||
      Object.values(supportedTypes).some(ext =>
        file.name.toLowerCase().endsWith(ext)
      )
    )

    if (validFiles.length === 0) {
      alert('Please select valid document files (PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX)')
      return
    }

    // Limit to last 10 files (most recent based on lastModified)
    const sortedFiles = validFiles
      .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))
      .slice(0, 10)

    setSelectedFiles(sortedFiles)
    setUploadStep('uploading')
    processUpload(sortedFiles)
  }

  const processUpload = async (files) => {
    setIsProcessing(true)
    setUploadProgress(0)

    // Build FormData for actual upload
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001'
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || res.statusText)
      }
      // Simulate progress bar as before
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50))
        setUploadProgress(i)
      }
      setUploadStep('success')
      setIsProcessing(false)
      // Notify parent with file details (no base64)
      onUpload(files.map(file => ({
        name: file.name,
        size: file.size,
        uploadTime: new Date().toLocaleString(),
        id: null // id will come from server when listing files
      })))
      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (err) {
      alert(`Upload failed: ${err.message}`)
      setIsProcessing(false)
      setUploadStep('selection')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (filename) => {
    const ext = filename.toLowerCase().split('.').pop()
    const icons = {
      pdf: '',
      doc: '',
      docx: '',
      txt: '',
      xls: '',
      xlsx: '',
      ppt: '️',
      pptx: '️'
    }
    return icons[ext] || ''
  }

  if (uploadStep === 'success') {
    return (
      <div className="upload-modal">
        <div className="upload-content success-upload">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h2>DOCUMENTS UPLOADED SUCCESSFULLY!</h2>
            <div className="upload-summary">
              <h3> Uploaded Files:</h3>
              <div className="file-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-icon">{getFileIcon(file.name)}</span>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatFileSize(file.size)}</div>
                    </div>
                    <span className="upload-check">✓</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="next-steps">
              <h3> AI Analysis Ready:</h3>
              <ul>
                <li data-icon="">Files encrypted and secured</li>
                <li data-icon="">Ready for AI processing</li>
                <li data-icon="">Available for analysis commands</li>
                <li data-icon="">Stored in secure session</li>
              </ul>
            </div>
            <div className="terminal-tip">
              <p> <strong>Terminal Tip:</strong> Use 'files' command to view all uploaded documents</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (uploadStep === 'uploading') {
    return (
      <div className="upload-modal">
        <div className="upload-content uploading">
          <div className="upload-animation">
            <h2> UPLOADING DOCUMENTS...</h2>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">{uploadProgress}%</div>
            </div>
            <div className="upload-status">
              <p> Establishing secure connection...</p>
              <p> Encrypting files with enterprise-grade security...</p>
              <p>☁️ Uploading to MAZLABZ secure servers...</p>
              <p> Preparing for AI analysis...</p>
            </div>
            <div className="file-preview">
              <h3>Files Being Processed:</h3>
              {selectedFiles.map((file, index) => (
                <div key={index} className="processing-file">
                  <span className="file-icon">{getFileIcon(file.name)}</span>
                  <span className="file-name">{file.name}</span>
                  <span className="processing-spinner">⟳</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="upload-modal">
      <div className="upload-content">
        <div className="modal-header">
          <h2> MOBILE DOCUMENT UPLOAD</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="upload-intro">
          <p>Upload your recent documents for AI analysis and enterprise processing.</p>
          <div className="security-badges">
            <span className="badge"> Encrypted</span>
            <span className="badge"> Mobile Ready</span>
            <span className="badge"> AI Analysis</span>
            <span className="badge">⚡ Instant Upload</span>
          </div>
        </div>
        <div className="upload-controls">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button className="select-btn" onClick={handleFileSelection}>
            Select Files
          </button>
        </div>
      </div>
    </div>
  )
}

export default DocumentUploader
