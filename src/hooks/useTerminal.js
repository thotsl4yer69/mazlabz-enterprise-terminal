import { useState, useEffect, useRef } from 'react'

export default function useTerminal(options) {
  const {
    openFileDialog,
    uploadedFiles,
    metadata,
    setShowLeadCapture,
    setShowROICalculator,
    setShowPaymentProcessor,
    setShowAdminDashboard,
    systemStatus
  } = options

  const [isBooted, setIsBooted] = useState(false)
  const [currentLine, setCurrentLine] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [output, setOutput] = useState([])
  const inputRef = useRef(null)
  const terminalRef = useRef(null)
  const [sessionId, setSessionId] = useState(null)

  const openFile = () => {
    setOutput(prev => [...prev, { type: 'success', content: 'Opening file upload dialog...' }])
    options.openFileDialog()
    return []
  }

  const bootSequence = [
    'MAZLABZ.ENTERPRISE v3.2.1 - INITIALIZING...',
    'Loading enterprise modules... [OK]',
    'Mounting secure filesystems... [OK]',
    'Starting AI services... [OK]',
    'Initializing enterprise security protocols... [OK]',
    'Loading Fortune 500 client profiles... [OK]',
    'Connecting to global infrastructure... [OK]',
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
      '  schedule     - Book executive meeting',
      '  upload       - Select files for analysis',
      '  files        - List uploaded files',
      '  metadata     - Display extracted metadata',
      '  admin        - Administrative dashboard',
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
      'ENTERPRISE TECHNICAL CAPABILITY MATRIX',
      '═══════════════════════════════════════',
      '',
      'ENTERPRISE AI & MACHINE LEARNING:',
      '  Platforms: TensorFlow Enterprise, PyTorch, NVIDIA AI',
      '  Frameworks: LangChain, Hugging Face, MLflow',
      '  Tooling: Kubernetes, Docker, Terraform',
      '',
      'CLOUD INFRASTRUCTURE:',
      '  Providers: AWS, Azure, Google Cloud',
      '  Security: Vault, Prisma Cloud, custom audit controls',
      '',
      'BUSINESS INTELLIGENCE:',
      '  Real-time data ingestion and analytics',
      '  Dashboard frameworks: Superset, Metabase',
      '',
      'DEPLOYMENT TOOLING:',
      '  GitHub Actions, Terraform Enterprise, custom CI/CD',
      '  Automated rollback and disaster recovery',
      '',
      'LANGUAGES & FRAMEWORKS:',
      '  Python, TypeScript, Go, Rust',
      '  FastAPI, React, Node.js',
      '',
      'ARCHITECTURE PRINCIPLES:',
      '  Zero-downtime deployments',
      '  Immutable infrastructure',
      '  Observability and proactive alerting',
      ''
    ],

    founder: () => [
      'CHIEF ARCHITECT - JACK MAZZINI',
      '═══════════════════════════════════════',
      '',
      'Enterprise systems architect with 15+ years building',
      'revenue-generating AI platforms for Fortune 500 companies.',
      'Specialized in transforming traditional businesses into',
      'AI-powered market leaders.',
      '',
      'ENTERPRISE EXPERTISE:',
      '• Large-scale AI/ML revenue automation systems',
      '• Industrial IoT and predictive maintenance platforms',
      '• Financial technology and regulatory compliance',
      '• Supply chain optimization and logistics intelligence',
      '• Cloud infrastructure and digital transformation',
      '• Real-time business intelligence and decision systems',
      '',
      'PROVEN TRACK RECORD:',
      '• 50+ successful enterprise AI deployments',
      '• $25M+ in documented client ROI',
      '• 100% project completion rate',
      '• 15+ Fortune 500 implementations',
      '',
      'PHILOSOPHY:',
      '"Enterprise AI must deliver measurable ROI within 90 days."',
      '"Scalable systems separate market leaders from followers."',
      '"Speed of AI adoption determines competitive survival."',
      '',
      'APPROACH:',
      '• Enterprise-grade security and compliance from day one',
      '• Rapid deployment with zero business disruption',
      '• Cross-industry expertise creates unique advantages',
      '• Hands-on implementation with C-suite accountability',
      '',
      'Recognized speaker at major AI and business conferences.',
      'Published thought leader on enterprise AI transformation.',
      ''
    ],

    contact: () => [
      'ENTERPRISE COMMUNICATION CHANNELS',
      '═══════════════════════════════════════',
      '',
      'EXECUTIVE CONTACT:',
      'Email: mazlabz.ai@gmail.com',
      'Direct: (+61) 493 719 523',
      'Location: Brunswick, VIC 3056, Australia',
      '',
      'ENTERPRISE SALES:',
      'Response Time: < 2 hours for Fortune 500 inquiries',
      'Availability: 24/7 for enterprise emergencies',
      'Minimum Engagement: AUD $25,000',
      '',
      'SECURE COMMUNICATIONS:',
      'Encryption: Enterprise PGP available',
      'Secure Channels: Signal, ProtonMail supported',
      'NDA: Standard for all enterprise discussions',
      '',
      'GLOBAL OFFICES:',
      'Asia-Pacific: Melbourne, Australia (HQ)',
      'North America: Partnership network',
      'Europe: Strategic alliance partners',
      '',
      '[COPY] Click to copy enterprise email',
      '[QUOTE] Request enterprise consultation',
      ''
    ],

    status: () => [
      'ENTERPRISE SYSTEM STATUS',
      '═══════════════════════════════════════',
      '',
      'Current Status: ONLINE - ACCEPTING ENTERPRISE PROJECTS',
      'Last Updated: ' + new Date().toLocaleString(),
      `CPU Usage: ${systemStatus.cpu}%`,
      `Memory Usage: ${systemStatus.memory}%`,
      `Uploaded Files: ${systemStatus.files}`,
      '',
      'CAPACITY ANALYSIS:',
      'Current Utilization: 75%',
      'Available Capacity: 2-3 Fortune 500 projects',
      'Response Time: < 2 hours for qualified inquiries',
      '',
      'PREFERRED PROJECT TYPES:',
      '• Emergency AI system implementations (< 30 days)',
      '• Revenue automation platforms ($1M+ impact)',
      '• Digital transformation initiatives',
      '• Regulatory compliance automation',
      '',
      'CURRENT ENTERPRISE QUEUE:',
      '• 3 Fortune 500 implementations in progress',
      '• 2 strategic consulting engagements',
      '• 1 emergency system recovery',
      '',
      'Next Available: Immediate for qualified enterprises',
      'Minimum Investment: AUD $25,000',
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

    schedule: () => [
      'EXECUTIVE MEETING SCHEDULER',
      '═══════════════════════════════════════',
      '',
      'AVAILABLE SLOTS:',
      'Emergency Consultation: Available 24/7',
      'Strategic Planning Session: Next available slot',
      'Technology Assessment: 2-hour deep dive',
      '',
      'TO SCHEDULE:',
      '1. Email: mazlabz.ai@gmail.com',
      '2. Subject: "Executive Meeting Request"',
      '3. Include: Company, urgency, preferred time',
      '',
      'Response Time: < 2 hours for Fortune 500',
      'Meeting Format: In-person, Video, or Phone',
      'Duration: 30 minutes to 2 hours based on scope',
      '',
      '[QUOTE] Request consultation',
      ''
    ],

    upload: () => openFile(),

    files: () => {
      if (uploadedFiles.length === 0) return ['No files uploaded']
      return uploadedFiles.map(f => f.name)
    },

    metadata: () => {
      if (metadata.length === 0) return ['No metadata extracted']
      const lines = []
      metadata.forEach(file => {
        lines.push(`File: ${file.name}`)
        Object.entries(file.data || {}).forEach(([k, v]) => {
          if (v) lines.push(`  ${k}: ${v}`)
        })
        lines.push('')
      })
      return lines
    },

    admin: () => {
      setShowAdminDashboard(true)
      return []
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

  useEffect(() => {
    let timeouts = []
    bootSequence.forEach((line, idx) => {
      const timeout = setTimeout(() => {
        setOutput(prev => [...prev, { type: 'boot', content: line }])
        if (idx === bootSequence.length - 1) {
          setTimeout(() => setIsBooted(true), 500)
        }
      }, idx * 100)
      timeouts.push(timeout)
    })
    return () => timeouts.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (isBooted && inputRef.current) inputRef.current.focus()
  }, [isBooted])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch('/api/research/session/create', { method: 'POST' })
        const data = await res.json()
        setSessionId(data.sessionId)
      } catch (err) {
        console.error('Session creation failed', err)
      }
    }
    createSession()
  }, [])

  const handleCommand = (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    setCommandHistory(prev => [...prev, cmd])
    setHistoryIndex(-1)
    setOutput(prev => [...prev, { type: 'command', content: `mazlabz@enterprise:~$ ${cmd}` }])

    if (commands[trimmedCmd]) {
      const result = commands[trimmedCmd]()
      if (result && result.length > 0) {
        result.forEach(line => setOutput(prev => [...prev, { type: 'output', content: line }]))
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
      setOutput(prev => [...prev,
        { type: 'error', content: `Command not recognized: ${trimmedCmd}` },
        { type: 'error', content: "Type 'help' for available enterprise commands." },
        { type: 'output', content: '' }
      ])
    }

    if (sessionId) {
      fetch('/api/research/behavioral/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, command: trimmedCmd })
      }).catch(() => {})
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

  const appendOutput = (line) => {
    setOutput(prev => [...prev, line])
  }

  return {
    isBooted,
    currentLine,
    setCurrentLine,
    output,
    inputRef,
    terminalRef,
    handleKeyDown,
    copyEmail,
    appendOutput,
    fileInputRef: options.fileInputRef,
    handleFiles: options.handleFiles,
    openFileDialog: openFile,
    uploadedFiles,
    metadata,
    sessionId
  }
}
