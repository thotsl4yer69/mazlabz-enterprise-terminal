import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PaymentProcessor = ({ onClose, projectData }) => {
  const [paymentStep, setPaymentStep] = useState('selection') // selection, processing, success
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const packages = [
    {
      id: 'strategic',
      name: 'Strategic Implementation',
      price: 5000,
      priceId: import.meta.env.VITE_STRIPE_STRATEGIC_PRICE,
      description: 'AI system implementation with 30-day deployment',
      features: ['AI Revenue Automation', 'Basic Analytics', '30-day implementation', 'Email support'],
      timeline: '30 days'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Platform',
      price: 15000,
      priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE,
      description: 'Complete enterprise AI transformation',
      features: ['Full AI Automation Suite', 'Advanced Analytics', 'Custom Integration', 'Priority support', '90-day implementation'],
      timeline: '90 days'
    },
    {
      id: 'transformation',
      name: 'Digital Transformation',
      price: 30000,
      priceId: import.meta.env.VITE_STRIPE_TRANSFORMATION_PRICE,
      description: 'Full enterprise system modernization',
      features: ['Complete Digital Overhaul', 'AI + Cloud Migration', 'Staff Training', 'Dedicated Success Manager', '6-month program'],
      timeline: '6 months'
    },
    {
      id: 'fortune500',
      name: 'Fortune 500 Program',
      price: 100000,
      priceId: import.meta.env.VITE_STRIPE_FORTUNE500_PRICE,
      description: 'Enterprise-wide AI transformation program',
      features: ['Multi-division Implementation', 'Custom AI Development', 'C-Suite Advisory', '24/7 Support', '12-month program', 'Guaranteed ROI'],
      timeline: '12 months'
    }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      minimumFractionDigits: 0 
    }).format(amount)
  }

  const handlePackageSelect = async (pkg) => {
    setSelectedPackage(pkg)
    setIsProcessing(true)
    
    try {
      const stripe = await stripePromise
      
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // Create Stripe Checkout Session
      const { error } = await stripe.redirectToCheckout({
        lineItems: [
          {
            price: pkg.priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        successUrl: `${window.location.origin}?payment=success&package=${pkg.id}`,
        cancelUrl: `${window.location.origin}?payment=cancelled`,
        customerEmail: 'mazlabz.ai@gmail.com', // Pre-fill with your email
        billingAddressCollection: 'required',
        phoneNumberCollection: {
          enabled: true,
        },
        customText: {
          submit: {
            message: 'Your MAZLABZ enterprise implementation will begin immediately upon payment confirmation.',
          },
        },
        metadata: {
          package_id: pkg.id,
          package_name: pkg.name,
          implementation_timeline: pkg.timeline,
          contact_email: 'mazlabz.ai@gmail.com'
        }
      })

      if (error) {
        console.error('Stripe Checkout error:', error)
        setIsProcessing(false)
        alert('Payment initialization failed. Please try again or contact mazlabz.ai@gmail.com')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setIsProcessing(false)
      alert('Payment system error. Please contact mazlabz.ai@gmail.com for immediate assistance.')
    }
  }

  // Check for payment success/failure on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment')
    const packageId = urlParams.get('package')
    
    if (paymentStatus === 'success' && packageId) {
      const pkg = packages.find(p => p.id === packageId)
      if (pkg) {
        setSelectedPackage(pkg)
        setPaymentStep('success')
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (paymentStatus === 'cancelled') {
      // Clean up URL and show selection again
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  if (paymentStep === 'success') {
    return (
      <div className="payment-modal">
        <div className="payment-content success-payment">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h2>PAYMENT SUCCESSFUL!</h2>
            <div className="success-details">
              <p><strong>Project Secured:</strong> {selectedPackage.name}</p>
              <p><strong>Investment:</strong> {formatCurrency(selectedPackage.price)}</p>
              <p><strong>Implementation Timeline:</strong> {selectedPackage.timeline}</p>
              <p><strong>Confirmation:</strong> Check your email for receipt</p>
            </div>
            
            <div className="next-steps">
              <h3>Next Steps:</h3>
              <ul>
                <li data-icon="✅">Enterprise project initiated</li>
                <li data-icon="📧">Payment receipt sent to your email</li>
                <li data-icon="📞">MAZLABZ team will contact you within 2 hours</li>
                <li data-icon="🚀">Project kickoff within 24 hours</li>
                <li data-icon="📋">Dedicated project manager assigned</li>
              </ul>
            </div>

            <div className="contact-info" style={{
              background: 'rgba(0, 212, 170, 0.1)',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid rgba(0, 212, 170, 0.2)'
            }}>
              <h4 style={{color: '#00d4aa', marginBottom: '10px'}}>Immediate Contact:</h4>
              <p style={{color: '#888', margin: '5px 0'}}>📧 mazlabz.ai@gmail.com</p>
              <p style={{color: '#888', margin: '5px 0'}}>📞 (+61) 493 719 523</p>
              <p style={{color: '#888', margin: '5px 0', fontSize: '12px'}}>Emergency support available 24/7</p>
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

  return (
    <div className="payment-modal">
      <div className="payment-content package-selection">
        <div className="modal-header">
          <h2>💳 SECURE ENTERPRISE INVESTMENT</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="payment-intro">
          <p>Secure your MAZLABZ enterprise implementation with Stripe-powered payments.</p>
          <div className="security-badges">
            <span className="badge">🔒 Stripe Secure</span>
            <span className="badge">🛡️ PCI Compliant</span>
            <span className="badge">✅ Enterprise Grade</span>
            <span className="badge">💳 All Cards Accepted</span>
          </div>
        </div>

        <div className="packages-grid">
          {packages.map(pkg => (
            <div key={pkg.id} className="package-card" onClick={() => handlePackageSelect(pkg)}>
              <div className="package-header">
                <h3>{pkg.name}</h3>
                <div className="package-price">
                  <span className="total-price">{formatCurrency(pkg.price)}</span>
                  <span className="downpayment">Implementation: {pkg.timeline}</span>
                </div>
              </div>
              <p className="package-description">{pkg.description}</p>
              <ul className="package-features">
                {pkg.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button 
                className="select-package-btn"
                disabled={isProcessing}
                style={{
                  opacity: isProcessing ? 0.6 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'PROCESSING...' : `SECURE ${formatCurrency(pkg.price)}`}
              </button>
            </div>
          ))}
        </div>

        <div className="payment-footer">
          <p className="payment-terms">
            <strong>Secure Payment:</strong> Powered by Stripe. Your payment is encrypted and secure. 
            Implementation begins immediately upon confirmation. Full enterprise support included.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentProcessor