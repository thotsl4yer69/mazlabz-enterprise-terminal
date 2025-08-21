import React, { useState } from 'react'
import './PigeonProtocol.css'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const PigeonProtocol = ({ onClose, sessionId }) => {
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    try {
      const res = await fetch(`${API_BASE}/api/pigeon/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, recipient, message })
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('delivered')
        setRecipient('')
        setMessage('')
      } else {
        setStatus(data.error || 'failed')
      }
    } catch (err) {
      console.error('Failed to send pigeon message')
      setStatus('failed')
    }
  }

  return (
    <div className="pigeon-modal">
      <div className="pigeon-content">
        <div className="modal-header">
          <h2>🕊️ Alternate Pigeon Protocol</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <p>Transmit secure messages using our experimental carrier pigeon network.</p>
        <form onSubmit={handleSubmit} className="pigeon-form">
          <input
            type="text"
            placeholder="Recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            required
          />
          <button type="submit">Send Pigeon</button>
        </form>
        {status === 'delivered' && (
          <p className="success">✅ Message dispatched via pigeon</p>
        )}
        {status && status !== 'delivered' && (
          <p className="error">❌ {status}</p>
        )}
      </div>
    </div>
  )
}

export default PigeonProtocol

