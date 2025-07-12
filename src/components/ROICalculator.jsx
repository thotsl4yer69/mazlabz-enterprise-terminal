import React, { useState, useEffect } from 'react'

const ROICalculator = ({ onClose }) => {
  const [inputs, setInputs] = useState({
    industry: '',
    revenue: '',
    employees: '',
    currentSystems: '',
    painPoint: '',
    timeline: ''
  })

  const [results, setResults] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const industryMultipliers = {
    'manufacturing': { efficiency: 2.8, cost: 2.2, revenue: 1.8 },
    'financial': { efficiency: 3.2, cost: 1.9, revenue: 2.4 },
    'healthcare': { efficiency: 2.5, cost: 3.1, revenue: 1.6 },
    'retail': { efficiency: 3.0, cost: 1.7, revenue: 2.8 },
    'technology': { efficiency: 3.5, cost: 1.5, revenue: 3.2 },
    'logistics': { efficiency: 2.9, cost: 2.5, revenue: 2.1 }
  }

  const calculateROI = () => {
    setIsCalculating(true)
    
    setTimeout(() => {
      const revenueNum = parseFloat(inputs.revenue)
      const employeesNum = parseInt(inputs.employees)
      const multiplier = industryMultipliers[inputs.industry] || { efficiency: 2.0, cost: 2.0, revenue: 2.0 }
      
      // Calculate potential savings and gains
      const efficiencyGains = (revenueNum * 0.15) * multiplier.efficiency
      const costReduction = (revenueNum * 0.08) * multiplier.cost
      const revenueIncrease = (revenueNum * 0.12) * multiplier.revenue
      
      const totalBenefit = efficiencyGains + costReduction + revenueIncrease
      const investmentRequired = Math.max(25000, Math.min(500000, revenueNum * 0.002))
      const roi = ((totalBenefit - investmentRequired) / investmentRequired) * 100
      
      setResults({
        totalBenefit: totalBenefit,
        investment: investmentRequired,
        roi: roi,
        paybackMonths: Math.ceil((investmentRequired / totalBenefit) * 12),
        yearOneProfit: totalBenefit - investmentRequired,
        efficiencyGains,
        costReduction,
        revenueIncrease
      })
      
      setIsCalculating(false)
    }, 2000)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      minimumFractionDigits: 0 
    }).format(amount)
  }

  return (
    <div className="roi-calculator-modal">
      <div className="roi-calculator-content">
        <div className="modal-header">
          <h2>📊 ENTERPRISE ROI CALCULATOR</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {!results ? (
          <div className="calculator-form">
            <p className="calculator-intro">
              Calculate your potential ROI from MAZLABZ AI implementation
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label>Industry Sector</label>
                <select
                  value={inputs.industry}
                  onChange={(e) => setInputs({...inputs, industry: e.target.value})}
                  required
                >
                  <option value="">Select Industry</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="financial">Financial Services</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="retail">Retail/E-commerce</option>
                  <option value="technology">Technology</option>
                  <option value="logistics">Logistics/Supply Chain</option>
                </select>
              </div>

              <div className="form-group">
                <label>Annual Revenue (AUD)</label>
                <select
                  value={inputs.revenue}
                  onChange={(e) => setInputs({...inputs, revenue: e.target.value})}
                  required
                >
                  <option value="">Select Revenue Range</option>
                  <option value="5000000">$5M - $10M</option>
                  <option value="15000000">$10M - $25M</option>
                  <option value="50000000">$25M - $100M</option>
                  <option value="250000000">$100M - $500M</option>
                  <option value="1000000000">$500M+</option>
                </select>
              </div>

              <div className="form-group">
                <label>Number of Employees</label>
                <select
                  value={inputs.employees}
                  onChange={(e) => setInputs({...inputs, employees: e.target.value})}
                  required
                >
                  <option value="">Select Size</option>
                  <option value="50">50-100</option>
                  <option value="250">100-500</option>
                  <option value="1000">500-2000</option>
                  <option value="5000">2000-10000</option>
                  <option value="15000">10000+</option>
                </select>
              </div>

              <div className="form-group">
                <label>Current Systems</label>
                <select
                  value={inputs.currentSystems}
                  onChange={(e) => setInputs({...inputs, currentSystems: e.target.value})}
                  required
                >
                  <option value="">Select Current State</option>
                  <option value="manual">Mostly Manual Processes</option>
                  <option value="basic">Basic Digital Systems</option>
                  <option value="integrated">Integrated Platforms</option>
                  <option value="advanced">Advanced Technology Stack</option>
                </select>
              </div>

              <div className="form-group">
                <label>Primary Pain Point</label>
                <select
                  value={inputs.painPoint}
                  onChange={(e) => setInputs({...inputs, painPoint: e.target.value})}
                  required
                >
                  <option value="">Select Main Challenge</option>
                  <option value="efficiency">Operational Efficiency</option>
                  <option value="costs">High Operating Costs</option>
                  <option value="growth">Revenue Growth</option>
                  <option value="compliance">Compliance & Risk</option>
                  <option value="competition">Competitive Pressure</option>
                </select>
              </div>

              <div className="form-group">
                <label>Implementation Timeline</label>
                <select
                  value={inputs.timeline}
                  onChange={(e) => setInputs({...inputs, timeline: e.target.value})}
                  required
                >
                  <option value="">Select Timeline</option>
                  <option value="immediate">Immediate (0-30 days)</option>
                  <option value="quarter">This Quarter (30-90 days)</option>
                  <option value="halfyear">6 Months</option>
                  <option value="year">12 Months</option>
                </select>
              </div>
            </div>

            <button 
              className="calculate-btn"
              onClick={calculateROI}
              disabled={!inputs.industry || !inputs.revenue || !inputs.employees || isCalculating}
            >
              {isCalculating ? 'CALCULATING ROI...' : 'CALCULATE ENTERPRISE ROI'}
            </button>
          </div>
        ) : (
          <div className="roi-results">
            <h3>🎯 YOUR ENTERPRISE ROI PROJECTION</h3>
            
            <div className="results-grid">
              <div className="result-card primary">
                <h4>Expected ROI</h4>
                <div className="result-value">{Math.round(results.roi)}%</div>
                <p>Return on Investment</p>
              </div>

              <div className="result-card">
                <h4>Total Annual Benefit</h4>
                <div className="result-value">{formatCurrency(results.totalBenefit)}</div>
                <p>Combined savings & gains</p>
              </div>

              <div className="result-card">
                <h4>Investment Required</h4>
                <div className="result-value">{formatCurrency(results.investment)}</div>
                <p>MAZLABZ implementation</p>
              </div>

              <div className="result-card">
                <h4>Payback Period</h4>
                <div className="result-value">{results.paybackMonths} months</div>
                <p>Time to break-even</p>
              </div>
            </div>

            <div className="breakdown">
              <h4>Benefit Breakdown:</h4>
              <div className="breakdown-item">
                <span>Efficiency Gains:</span>
                <span>{formatCurrency(results.efficiencyGains)}</span>
              </div>
              <div className="breakdown-item">
                <span>Cost Reduction:</span>
                <span>{formatCurrency(results.costReduction)}</span>
              </div>
              <div className="breakdown-item">
                <span>Revenue Increase:</span>
                <span>{formatCurrency(results.revenueIncrease)}</span>
              </div>
            </div>

            <div className="result-footer">
              <p className="disclaimer">
                *Projections based on MAZLABZ client historical data and industry benchmarks. 
                Actual results may vary based on implementation scope and execution.
              </p>
              
              <button 
                className="contact-btn"
                onClick={() => {
                  onClose()
                  // Trigger contact form
                  window.dispatchEvent(new CustomEvent('openLeadCapture'))
                }}
              >
                REQUEST DETAILED PROPOSAL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ROICalculator