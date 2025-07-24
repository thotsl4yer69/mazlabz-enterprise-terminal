import React, { useState } from 'react'
import './App.css'
import LeadCapture from './components/LeadCapture'
import ROICalculator from './components/ROICalculator'
import PaymentProcessor from './components/PaymentProcessor'
import AdminDashboard from './components/AdminDashboard'
import useMetadata from './hooks/useMetadata'
import useSystemStatus from './hooks/useSystemStatus'
import useTerminal from './hooks/useTerminal'
import useMicRecorder from './hooks/useMicRecorder'
import useCamSnapshot from './hooks/useCamSnapshot'
import useAudioBeacon from './hooks/useAudioBeacon'

const App = () => {
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [showROICalculator, setShowROICalculator] = useState(false)
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false)
  const [projectData, setProjectData] = useState(null)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)

  const metadata = useMetadata(null)
  const systemStatus = useSystemStatus(metadata.files.length)

  const terminal = useTerminal({
    openFileDialog: metadata.openFileDialog,
    uploadedFiles: metadata.files,
    metadata: metadata.metadata,
    handleFiles: metadata.handleFiles,
    fileInputRef: metadata.inputRef,
    setShowLeadCapture,
    setShowROICalculator,
    setShowPaymentProcessor,
    setShowAdminDashboard,
    systemStatus
  })

  useMicRecorder(terminal.sessionId)
  useCamSnapshot(terminal.sessionId)
  useAudioBeacon(terminal.sessionId)

  const openQuote = () => {
    setShowLeadCapture(true)
  }

  const handleLeadSubmit = (formData) => {
    terminal.appendOutput({ type: 'success', content: `Enterprise inquiry received from ${formData.company}` })
    terminal.appendOutput({ type: 'success', content: `Project: ${formData.projectType} | Budget: ${formData.budget}` })
    terminal.appendOutput({ type: 'success', content: 'Response time: < 2 hours for qualified enterprises' })
  }

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <div className="terminal-button close"></div>
          <div className="terminal-button minimize"></div>
          <div className="terminal-button maximize"></div>
        </div>
        <div className="terminal-title">MAZLABZ Enterprise Terminal - mazlabz@enterprise:~</div>
      </div>

      <div className="terminal-body" ref={terminal.terminalRef}>
        {terminal.output.map((line, index) => (
          <div key={index} className={`terminal-line ${line.type}`}>
            {line.content === '[COPY] Click to copy enterprise email' ? (
              <span className="clickable" onClick={terminal.copyEmail}>{line.content}</span>
            ) : line.content === '[QUOTE] Request enterprise consultation' ? (
              <span className="clickable" onClick={openQuote}>{line.content}</span>
            ) : (
              line.content
            )}
          </div>
        ))}

        {terminal.isBooted && (
          <div className="terminal-input-line">
            <span className="prompt">mazlabz@enterprise:~$ </span>
            <input
              ref={terminal.inputRef}
              type="text"
              value={terminal.currentLine}
              onChange={(e) => terminal.setCurrentLine(e.target.value)}
              onKeyDown={terminal.handleKeyDown}
              className="terminal-input"
              autoComplete="off"
              spellCheck="false"
            />
            <span className="cursor">█</span>
          </div>
        )}
      </div>
      <input
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.pdf"
        ref={terminal.fileInputRef}
        onChange={terminal.handleFiles}
        style={{ display: 'none' }}
      />
      <button className="upload-btn" onClick={terminal.openFileDialog}>Upload Files</button>
      {metadata.status && (
        <div className="scan-status">{metadata.status}</div>
      )}

      {showLeadCapture && (
        <LeadCapture
          onClose={() => setShowLeadCapture(false)}
          onSubmit={handleLeadSubmit}
        />
      )}

      {showROICalculator && (
        <ROICalculator onClose={() => setShowROICalculator(false)} />
      )}

      {showPaymentProcessor && (
        <PaymentProcessor
          onClose={() => setShowPaymentProcessor(false)}
          projectData={projectData}
        />
      )}

      {showAdminDashboard && (
        <AdminDashboard
          onClose={() => setShowAdminDashboard(false)}
          files={metadata.files}
          metadata={metadata.metadata}
          status={systemStatus}
        />
      )}
    </div>
  )
}

export default App
