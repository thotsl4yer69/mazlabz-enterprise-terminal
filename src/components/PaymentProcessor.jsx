import React, { useState } from 'react'

const PaymentProcessor = ({ onClose, projectData }) => {
  const [paymentStep, setPaymentStep] = useState('selection') // selection, payment, processing, success
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Australia'
  })

  const packages = [
    {
      id: 'strategic',
      name: 'Strategic Implementation',
      price: 25000,
      downpayment: 5000,
      description: 'AI system implementation with 30-day deployment',
      features: ['AI Revenue Automation', 'Basic Analytics', '30-day implementation', 'Email support']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Platform',
      price: 75000,
      downpayment: 15000,
      description: 'Complete enterprise AI transformation',
      features: ['Full AI Automation Suite', 'Advanced Analytics', 'Custom Integration', 'Priority support', '90-day implementation']
    },
    {
      id: 'transformation',
      name: 'Digital Transformation',
      price: 150000,
      downpayment: 30000,
      description: 'Full enterprise system modernization',
      features: ['Complete Digital Overhaul', 'AI + Cloud Migration', 'Staff Training', 'Dedicated Success Manager', '6-month program']
    },
    {
      id: 'fortune500',
      name: 'Fortune 500 Program',
      price: 500000,
      downpayment: 100000,
      description: 'Enterprise-wide AI transformation program',
      features: ['Multi-division Implementation', 'Custom AI Development', 'C-Suite Advisory', '24/7 Support', '12-month program', 'Guaranteed ROI']
    }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      minimumFractionDigits: 0 
    }).format(amount)
  }

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    setPaymentStep('payment')
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    setPaymentStep('processing')
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStep('success')
      
      // In real implementation, this would integrate with Stripe/PayPal
      console.log('Payment processed:', {
        package: selectedPackage,
        payment: paymentData,
        project: projectData
      })
    }, 3000)
  }

  const handleInputChange = (field, value) => {
    if (field === 'cardNumber') {
      // Format card number with spaces
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
      value = value.substring(0, 19) // Limit to 16 digits + spaces
    } else if (field === 'expiryDate') {
      // Format expiry date as MM/YY
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5)
    } else if (field === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4)
    }
    
    setPaymentData(prev => ({ ...prev, [field]: value }))
  }

  if (paymentStep === 'selection') {
    return (
      <div className="payment-modal">
        <div className="payment-content package-selection">
          <div className="modal-header">
            <h2>💳 SECURE PROJECT INITIATION</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>

          <div className="payment-intro">
            <p>Secure your MAZLABZ enterprise implementation with an encrypted downpayment.</p>
            <div className="security-badges">
              <span className="badge">🔒 256-bit SSL</span>
              <span className="badge">🛡️ PCI Compliant</span>
              <span className="badge">✅ Enterprise Grade</span>
            </div>
          </div>

          <div className="packages-grid">
            {packages.map(pkg => (
              <div key={pkg.id} className="package-card" onClick={() => handlePackageSelect(pkg)}>
                <div className="package-header">
                  <h3>{pkg.name}</h3>
                  <div className="package-price">
                    <span className="total-price">{formatCurrency(pkg.price)}</span>
                    <span className="downpayment">Downpayment: {formatCurrency(pkg.downpayment)}</span>
                  </div>
                </div>
                <p className="package-description">{pkg.description}</p>
                <ul className="package-features">
                  {pkg.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <button className="select-package-btn">
                  SECURE WITH {formatCurrency(pkg.downpayment)}
                </button>
              </div>
            ))}
          </div>

          <div className="payment-footer">
            <p className="payment-terms">
              <strong>Payment Terms:</strong> Downpayment secures project slot. Remaining balance due at milestones. 
              Full refund available within 7 days of project start.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (paymentStep === 'payment') {
    return (
      <div className="payment-modal">
        <div className="payment-content payment-form">
          <div className="modal-header">
            <h2>💳 SECURE PAYMENT - {selectedPackage.name}</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>

          <div className="payment-summary">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>Project: {selectedPackage.name}</span>
              <span>{formatCurrency(selectedPackage.price)}</span>
            </div>
            <div className="summary-item downpayment">
              <span>Downpayment (20%)</span>
              <span>{formatCurrency(selectedPackage.downpayment)}</span>
            </div>
            <div className="summary-item remaining">
              <span>Remaining Balance</span>
              <span>{formatCurrency(selectedPackage.price - selectedPackage.downpayment)}</span>
            </div>
          </div>

          <form onSubmit={handlePaymentSubmit} className="payment-form-grid">
            <h3>Payment Information</h3>
            
            <div className="form-group full-width">
              <label>Card Number *</label>
              <input
                type="text"
                value={paymentData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>

            <div className="form-group">
              <label>Expiry Date *</label>
              <input
                type="text"
                value={paymentData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder="MM/YY"
                required
              />
            </div>

            <div className="form-group">
              <label>CVV *</label>
              <input
                type="text"
                value={paymentData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Name on Card *</label>
              <input
                type="text"
                value={paymentData.nameOnCard}
                onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>

            <h3 style={{gridColumn: '1 / -1', marginTop: '20px'}}>Billing Address</h3>

            <div className="form-group full-width">
              <label>Street Address *</label>
              <input
                type="text"
                value={paymentData.billingAddress}
                onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                placeholder="123 Enterprise Street"
                required
              />
            </div>

            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={paymentData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Melbourne"
                required
              />
            </div>

            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                value={paymentData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="VIC"
                required
              />
            </div>

            <div className="form-group">
              <label>Zip Code *</label>
              <input
                type="text"
                value={paymentData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="3000"
                required
              />
            </div>

            <div className="form-group">
              <label>Country *</label>
              <select
                value={paymentData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                required
              >
                <option value="Australia">Australia</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="New Zealand">New Zealand</option>
              </select>
            </div>

            <div className="payment-security">
              <div className="security-info">
                🔒 Your payment is encrypted and secure. We never store your card details.
              </div>
              <button type="submit" className="process-payment-btn">
                PROCESS PAYMENT - {formatCurrency(selectedPackage.downpayment)}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (paymentStep === 'processing') {
    return (
      <div className="payment-modal">
        <div className="payment-content processing">
          <div className="processing-animation">
            <div className="spinner"></div>
            <h2>Processing Payment...</h2>
            <p>Encrypting transaction data</p>
            <p>Validating payment information</p>
            <p>Securing project slot</p>
          </div>
        </div>
      </div>
    )
  }

  if (paymentStep === 'success') {
    return (
      <div className="payment-modal">
        <div className="payment-content success-payment">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h2>PAYMENT SUCCESSFUL!</h2>
            <div className="success-details">
              <p><strong>Project Secured:</strong> {selectedPackage.name}</p>
              <p><strong>Downpayment:</strong> {formatCurrency(selectedPackage.downpayment)}</p>
              <p><strong>Confirmation ID:</strong> MAZLABZ-{Date.now()}</p>
            </div>
            
            <div className="next-steps">
              <h3>Next Steps:</h3>
              <ul>
                <li>✅ Project slot reserved in enterprise queue</li>
                <li>📧 Confirmation email sent to mazlabz.ai@gmail.com</li>
                <li>📞 MAZLABZ team will contact you within 2 hours</li>
                <li>📋 Detailed project kickoff within 24 hours</li>
              </ul>
            </div>

            <button 
              className="close-success-btn"
              onClick={onClose}
            >
              RETURN TO TERMINAL
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default PaymentProcessor