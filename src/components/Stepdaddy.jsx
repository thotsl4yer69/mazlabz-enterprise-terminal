import React, { useState, useEffect } from 'react'
import './Stepdaddy.css'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const Stepdaddy = ({ onClose, onOutput }) => {
  const [activeService, setActiveService] = useState('dashboard')
  const [services, setServices] = useState({
    homeassistant: { status: 'disconnected', entities: [] },
    plex: { status: 'disconnected', servers: [], currentMedia: null },
    youtube: { status: 'disconnected', playlists: [] },
    spotify: { status: 'disconnected', currentTrack: null, playlists: [] },
    alexa: { status: 'disconnected', devices: [] },
    hue: { status: 'disconnected', lights: [], scenes: [] }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadServicesStatus()
  }, [])

  const loadServicesStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/stepdaddy/status`)
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
      }
    } catch (error) {
      console.error('Failed to load services status:', error)
      onOutput?.(['❌ Failed to connect to Stepdaddy hub', 'Check configuration and try again'])
    } finally {
      setLoading(false)
    }
  }

  const connectService = async (serviceName) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/stepdaddy/${serviceName}/connect`, {
        method: 'POST'
      })
      if (response.ok) {
        await loadServicesStatus()
        onOutput?.([`✅ ${serviceName.toUpperCase()} connected successfully`])
      }
    } catch (error) {
      console.error(`Failed to connect ${serviceName}:`, error)
      onOutput?.([`❌ Failed to connect to ${serviceName.toUpperCase()}`])
    } finally {
      setLoading(false)
    }
  }

  const executeCommand = async (serviceName, command, params = {}) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/stepdaddy/${serviceName}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, params })
      })
      if (response.ok) {
        const result = await response.json()
        onOutput?.(result.messages || [`✅ ${command} executed successfully`])
        await loadServicesStatus()
      }
    } catch (error) {
      console.error(`Failed to execute ${command}:`, error)
      onOutput?.([`❌ Failed to execute ${command}`])
    } finally {
      setLoading(false)
    }
  }

  const renderDashboard = () => (
    <div className="stepdaddy-dashboard">
      <h3>🏠 Stepdaddy Smart Home Hub</h3>
      <div className="services-grid">
        {Object.entries(services).map(([name, service]) => (
          <div key={name} className={`service-card ${service.status}`}>
            <div className="service-header">
              <h4>{getServiceIcon(name)} {name.toUpperCase()}</h4>
              <span className={`status-indicator ${service.status}`}>
                {service.status === 'connected' ? '🟢' : '🔴'}
              </span>
            </div>
            <div className="service-actions">
              {service.status === 'disconnected' ? (
                <button onClick={() => connectService(name)} disabled={loading}>
                  Connect
                </button>
              ) : (
                <button onClick={() => setActiveService(name)}>
                  Control
                </button>
              )}
            </div>
            <div className="service-info">
              {getServiceInfo(name, service)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const getServiceIcon = (name) => {
    const icons = {
      homeassistant: '🏡',
      plex: '🎬',
      youtube: '📺',
      spotify: '🎵',
      alexa: '🗣️',
      hue: '💡'
    }
    return icons[name] || '⚙️'
  }

  const getServiceInfo = (name, service) => {
    if (service.status === 'disconnected') return 'Not connected'
    
    switch (name) {
      case 'homeassistant':
        return `${service.entities?.length || 0} entities`
      case 'plex':
        return service.currentMedia ? `Playing: ${service.currentMedia}` : 'Idle'
      case 'spotify':
        return service.currentTrack ? `♪ ${service.currentTrack}` : 'Not playing'
      case 'alexa':
        return `${service.devices?.length || 0} devices`
      case 'hue':
        return `${service.lights?.length || 0} lights`
      default:
        return 'Connected'
    }
  }

  const renderServiceControl = () => {
    const service = services[activeService]
    if (!service || service.status === 'disconnected') {
      return (
        <div className="service-control">
          <h3>Service not connected</h3>
          <button onClick={() => connectService(activeService)}>Connect {activeService}</button>
        </div>
      )
    }

    switch (activeService) {
      case 'homeassistant':
        return renderHomeAssistantControl(service)
      case 'plex':
        return renderPlexControl(service)
      case 'youtube':
        return renderYouTubeControl(service)
      case 'spotify':
        return renderSpotifyControl(service)
      case 'alexa':
        return renderAlexaControl(service)
      case 'hue':
        return renderHueControl(service)
      default:
        return <div>Service control not available</div>
    }
  }

  const renderHomeAssistantControl = (service) => (
    <div className="service-control home-assistant">
      <h3>🏡 Home Assistant</h3>
      <div className="control-sections">
        <div className="section">
          <h4>Quick Actions</h4>
          <button onClick={() => executeCommand('homeassistant', 'turn_on_lights')}>
            Turn On All Lights
          </button>
          <button onClick={() => executeCommand('homeassistant', 'turn_off_lights')}>
            Turn Off All Lights
          </button>
          <button onClick={() => executeCommand('homeassistant', 'goodnight')}>
            Good Night Scene
          </button>
        </div>
        <div className="section">
          <h4>Entities ({service.entities?.length || 0})</h4>
          <div className="entities-list">
            {service.entities?.slice(0, 5).map((entity, idx) => (
              <div key={idx} className="entity-item">{entity}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderPlexControl = (service) => (
    <div className="service-control plex">
      <h3>🎬 Plex Media Server</h3>
      <div className="control-sections">
        <div className="section">
          <h4>Media Control</h4>
          {service.currentMedia ? (
            <div className="current-media">
              <p>Now Playing: {service.currentMedia}</p>
              <div className="media-controls">
                <button onClick={() => executeCommand('plex', 'pause')}>⏸️ Pause</button>
                <button onClick={() => executeCommand('plex', 'play')}>▶️ Play</button>
                <button onClick={() => executeCommand('plex', 'stop')}>⏹️ Stop</button>
              </div>
            </div>
          ) : (
            <p>No media currently playing</p>
          )}
        </div>
        <div className="section">
          <h4>Quick Access</h4>
          <button onClick={() => executeCommand('plex', 'browse_movies')}>Browse Movies</button>
          <button onClick={() => executeCommand('plex', 'browse_tv')}>Browse TV Shows</button>
        </div>
      </div>
    </div>
  )

  const renderYouTubeControl = (service) => (
    <div className="service-control youtube">
      <h3>📺 YouTube</h3>
      <div className="control-sections">
        <div className="section">
          <h4>Quick Actions</h4>
          <button onClick={() => executeCommand('youtube', 'open_trending')}>Open Trending</button>
          <button onClick={() => executeCommand('youtube', 'open_subscriptions')}>Subscriptions</button>
        </div>
        <div className="section">
          <h4>Playlists</h4>
          {service.playlists?.map((playlist, idx) => (
            <button key={idx} onClick={() => executeCommand('youtube', 'play_playlist', { playlist })}>
              {playlist}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSpotifyControl = (service) => (
    <div className="service-control spotify">
      <h3>🎵 Spotify</h3>
      <div className="control-sections">
        <div className="section">
          <h4>Now Playing</h4>
          {service.currentTrack ? (
            <div className="current-track">
              <p>♪ {service.currentTrack}</p>
              <div className="music-controls">
                <button onClick={() => executeCommand('spotify', 'previous')}>⏮️</button>
                <button onClick={() => executeCommand('spotify', 'pause')}>⏸️</button>
                <button onClick={() => executeCommand('spotify', 'play')}>▶️</button>
                <button onClick={() => executeCommand('spotify', 'next')}>⏭️</button>
              </div>
            </div>
          ) : (
            <p>Nothing playing</p>
          )}
        </div>
        <div className="section">
          <h4>Quick Play</h4>
          <button onClick={() => executeCommand('spotify', 'play_liked')}>Liked Songs</button>
          <button onClick={() => executeCommand('spotify', 'play_discover')}>Discover Weekly</button>
        </div>
      </div>
    </div>
  )

  const renderAlexaControl = (service) => (
    <div className="service-control alexa">
      <h3>🗣️ Alexa Home Hub</h3>
      <div className="control-sections">
        <div className="section">
          <h4>Devices ({service.devices?.length || 0})</h4>
          {service.devices?.map((device, idx) => (
            <div key={idx} className="device-item">
              <span>{device}</span>
              <button onClick={() => executeCommand('alexa', 'control_device', { device })}>
                Control
              </button>
            </div>
          ))}
        </div>
        <div className="section">
          <h4>Quick Commands</h4>
          <button onClick={() => executeCommand('alexa', 'announce', { message: 'Stepdaddy activated' })}>
            Test Announcement
          </button>
        </div>
      </div>
    </div>
  )

  const renderHueControl = (service) => (
    <div className="service-control hue">
      <h3>💡 Philips Hue</h3>
      <div className="control-sections">
        <div className="section">
          <h4>Lighting Control</h4>
          <div className="lighting-controls">
            <button onClick={() => executeCommand('hue', 'all_on')}>All Lights On</button>
            <button onClick={() => executeCommand('hue', 'all_off')}>All Lights Off</button>
            <button onClick={() => executeCommand('hue', 'dim', { level: 50 })}>Dim 50%</button>
            <button onClick={() => executeCommand('hue', 'bright')}>Full Brightness</button>
          </div>
        </div>
        <div className="section">
          <h4>Scenes</h4>
          {service.scenes?.map((scene, idx) => (
            <button key={idx} onClick={() => executeCommand('hue', 'activate_scene', { scene })}>
              {scene}
            </button>
          ))}
        </div>
        <div className="section">
          <h4>Lights ({service.lights?.length || 0})</h4>
          <div className="lights-grid">
            {service.lights?.slice(0, 6).map((light, idx) => (
              <div key={idx} className="light-item">
                <span>{light}</span>
                <button onClick={() => executeCommand('hue', 'toggle_light', { light })}>
                  Toggle
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="stepdaddy-overlay">
      <div className="stepdaddy-container">
        <div className="stepdaddy-header">
          <h2>🏠 Stepdaddy Smart Home Hub</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="stepdaddy-nav">
          <button 
            className={activeService === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveService('dashboard')}
          >
            Dashboard
          </button>
          {Object.keys(services).map(service => (
            <button
              key={service}
              className={activeService === service ? 'active' : ''}
              onClick={() => setActiveService(service)}
              disabled={services[service].status === 'disconnected'}
            >
              {getServiceIcon(service)} {service}
            </button>
          ))}
        </div>

        <div className="stepdaddy-content">
          {loading && <div className="loading">Loading...</div>}
          {activeService === 'dashboard' ? renderDashboard() : renderServiceControl()}
        </div>
      </div>
    </div>
  )
}

export default Stepdaddy