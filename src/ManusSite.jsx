import React from 'react'
import './ManusSite.css'

const ManusSite = () => {
  return (
    <div className="manus-container">
      <header className="manus-hero">
        <h1>Manus</h1>
        <p>Adaptive knowledge engine for modern applications.</p>
        <a href="#contact" className="cta-button">Get in Touch</a>
      </header>
      <section className="manus-section">
        <h2>Why Manus?</h2>
        <p>
          Manus integrates data, reasoning and user intent to deliver precise answers and
          streamlined automation.
        </p>
        <div className="features">
          <div className="feature">
            <h3>Realtime Insights</h3>
            <p>Connect live data sources and surface actionable context in milliseconds.</p>
          </div>
          <div className="feature">
            <h3>Secure by Design</h3>
            <p>Built with enterprise security primitives for safe deployment.</p>
          </div>
          <div className="feature">
            <h3>Flexible APIs</h3>
            <p>Embed Manus in existing stacks or build new experiences on top.</p>
          </div>
        </div>
      </section>
      <section className="manus-section" id="contact">
        <h2>Contact</h2>
        <p>Email <a href="mailto:hello@manus.im">hello@manus.im</a> to request early access.</p>
      </section>
    </div>
  )
}

export default ManusSite
