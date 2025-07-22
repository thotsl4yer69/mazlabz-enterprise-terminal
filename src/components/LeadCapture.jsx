import React, { useState } from 'react'
import './LeadCapture.css'

const LeadCapture = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Send lead data to configured endpoint (no extra friction)
      if (import.meta.env.VITE_LEAD_ENDPOINT) {
        await fetch(import.meta.env.VITE_LEAD_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }
      setSubmitted(true)
      onSubmit(formData)
      setTimeout(() => onClose(), 3000)
    } catch (err) {
      console.error('Lead capture failed', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="lead-capture-modal">
        <div className="lead-capture-content success">
          <h2>✅ ENTERPRISE INQUIRY RECEIVED</h2>
          <p>Thank you {formData.name}!</p>
          <p>Your enterprise inquiry has been logged and prioritized.</p>
          <p><strong>Response Time:</strong> &lt; 2 hours for Fortune 500</p>
          <p><strong>Next Steps:</strong> Enterprise consultation scheduled</p>
          <div className="success-animation">
            <div className="checkmark">✓</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lead-capture-modal">
      <div className="lead-capture-content">
        <div className="modal-header">
          <h2>🚀 ENTERPRISE AI CONSULTATION</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Executive Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Chief Technology Officer"
              />
            </div>

            <div className="form-group">
              <label>Enterprise Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="cto@fortune500.com"
              />
            </div>

            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                required
                placeholder="Fortune 500 Corporation"
              />
            </div>

            <div className="form-group">
              <label>Direct Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label>Enterprise Project Type *</label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                required
              >
                <option value="">Select Project Type</option>
                <option value="ai-automation">AI Revenue Automation</option>
                <option value="digital-transformation">Digital Transformation</option>
                <option value="predictive-analytics">Predictive Analytics</option>
                <option value="compliance-automation">Compliance Automation</option>
                <option value="supply-chain">Supply Chain Intelligence</option>
                <option value="emergency-consulting">Emergency AI Consulting</option>
                <option value="strategic-advisory">Executive Advisory</option>
              </select>
            </div>

            <div className="form-group">
              <label>Investment Budget *</label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                required
              >
                <option value="">Select Budget Range</option>
                <option value="25k-75k">$25K - $75K (Strategic Implementation)</option>
                <option value="75k-150k">$75K - $150K (Enterprise Platform)</option>
                <option value="150k-500k">$150K - $500K (Full Transformation)</option>
                <option value="500k+">$500K+ (Fortune 500 Program)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Implementation Timeline *</label>
              <select
                value={formData.timeline}
                onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                required
              >
                <option value="">Select Timeline</option>
                <option value="immediate">Immediate (Emergency)</option>
                <option value="30-days">30 Days (Rapid Deployment)</option>
                <option value="90-days">90 Days (Standard)</option>
                <option value="6-months">6 Months (Strategic)</option>
                <option value="12-months">12+ Months (Enterprise Program)</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Project Requirements</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Describe your enterprise AI requirements, current challenges, and success metrics..."
                rows="4"
              />
            </div>
          </div>

          <div className="form-footer">
            <p className="disclaimer">
              <strong>Enterprise Grade Security:</strong> All communications encrypted and NDA protected. 
              Minimum engagement: $25,000.
            </p>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'PROCESSING...' : 'REQUEST ENTERPRISE CONSULTATION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LeadCapture
