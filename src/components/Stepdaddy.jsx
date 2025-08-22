import React, { useState, useEffect } from 'react'
import './Stepdaddy.css'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const Stepdaddy = ({ onClose, onOutput, initialActiveService = 'dashboard' }) => {
  const [activeService, setActiveService] = useState(initialActiveService)
  const [services, setServices] = useState({
    homeassistant: { status: 'disconnected', entities: [] },
    plex: { status: 'disconnected', servers: [], currentMedia: null },
    youtube: { status: 'disconnected', playlists: [] },
    spotify: { status: 'disconnected', currentTrack: null, playlists: [] },
    alexa: { status: 'disconnected', devices: [] },
    hue: { status: 'disconnected', lights: [], scenes: [] }
  })
  const [loading, setLoading] = useState(false)
  const [automationRules, setAutomationRules] = useState([
    { id: 1, name: 'Good Morning', trigger: 'Time: 7:00 AM', actions: ['Turn on lights', 'Start coffee maker'], enabled: true },
    { id: 2, name: 'Movie Night', trigger: 'Plex: Play Movie', actions: ['Dim lights to 20%', 'Close blinds'], enabled: true },
    { id: 3, name: 'Goodnight', trigger: 'Time: 11:00 PM', actions: ['Turn off all lights', 'Lock doors', 'Set thermostat to 68°F'], enabled: false }
  ])
  const [energyData, setEnergyData] = useState({
    currentUsage: 2.3, // kW
    dailyUsage: 18.7, // kWh
    monthlyCost: 145.30, // AUD
    savingsTarget: 15, // %
    connectedDevices: 23,
    smartSavings: 23.50 // AUD saved this month
  })

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

  const renderAutomation = () => (
    <div className="automation-hub">
      <h3>🤖 Smart Home Automation</h3>
      <div className="automation-sections">
        <div className="automation-rules">
          <h4>Automation Rules</h4>
          <div className="rules-list">
            {automationRules.map(rule => (
              <div key={rule.id} className={`rule-card ${rule.enabled ? 'enabled' : 'disabled'}`}>
                <div className="rule-header">
                  <h5>{rule.name}</h5>
                  <button 
                    className={`toggle-btn ${rule.enabled ? 'on' : 'off'}`}
                    onClick={() => toggleRule(rule.id)}
                  >
                    {rule.enabled ? '🟢' : '🔴'}
                  </button>
                </div>
                <div className="rule-details">
                  <div className="trigger">📅 {rule.trigger}</div>
                  <div className="actions">
                    {rule.actions.map((action, idx) => (
                      <span key={idx} className="action-tag">⚡ {action}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="add-rule-btn" onClick={createNewRule}>
            + Add New Automation Rule
          </button>
        </div>
        <div className="quick-scenes">
          <h4>Quick Actions</h4>
          <div className="scene-buttons">
            <button onClick={() => executeScene('good-morning')}>🌅 Good Morning</button>
            <button onClick={() => executeScene('movie-night')}>🍿 Movie Night</button>
            <button onClick={() => executeScene('party-mode')}>🎉 Party Mode</button>
            <button onClick={() => executeScene('goodnight')}>🌙 Goodnight</button>
            <button onClick={() => executeScene('away-mode')}>🚗 Away Mode</button>
            <button onClick={() => executeScene('work-focus')}>💼 Work Focus</button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEnergyDashboard = () => (
    <div className="energy-dashboard">
      <h3>⚡ Energy Management</h3>
      <div className="energy-overview">
        <div className="energy-stats">
          <div className="stat-card current">
            <h4>Current Usage</h4>
            <div className="stat-value">{energyData.currentUsage} kW</div>
            <div className="stat-trend">↓ 15% from yesterday</div>
          </div>
          <div className="stat-card daily">
            <h4>Today's Usage</h4>
            <div className="stat-value">{energyData.dailyUsage} kWh</div>
            <div className="stat-trend">↑ 8% from average</div>
          </div>
          <div className="stat-card cost">
            <h4>Monthly Cost</h4>
            <div className="stat-value">A${energyData.monthlyCost}</div>
            <div className="stat-trend">💚 A${energyData.smartSavings} saved</div>
          </div>
        </div>
        <div className="energy-devices">
          <h4>Smart Device Power ({energyData.connectedDevices} devices)</h4>
          <div className="device-power-list">
            <div className="device-power">💡 Smart Lights: 0.3 kW</div>
            <div className="device-power">🌡️ Smart Thermostat: 1.2 kW</div>
            <div className="device-power">📺 Entertainment System: 0.8 kW</div>
            <div className="device-power">🔌 Smart Outlets: 0.2 kW</div>
          </div>
        </div>
        <div className="energy-recommendations">
          <h4>💡 Energy Saving Recommendations</h4>
          <div className="recommendation">Lower thermostat by 2°F to save A$12/month</div>
          <div className="recommendation">Use movie scene lighting to reduce consumption 25%</div>
          <div className="recommendation">Schedule coffee maker for off-peak hours</div>
        </div>
      </div>
    </div>
  )

  const renderSceneManagement = () => (
    <div className="scene-management">
      <h3>🎭 Smart Home Scenes</h3>
      <div className="scenes-grid">
        <div className="scene-card">
          <h4>🌅 Good Morning</h4>
          <div className="scene-actions">
            <div>💡 Lights: Gradual on (30min)</div>
            <div>🌡️ Thermostat: 72°F</div>
            <div>☕ Coffee Maker: Start</div>
            <div>📻 Play Morning News</div>
          </div>
          <button onClick={() => executeScene('good-morning')}>Activate Scene</button>
        </div>
        <div className="scene-card">
          <h4>🍿 Movie Night</h4>
          <div className="scene-actions">
            <div>💡 Lights: Dim to 20%</div>
            <div>📺 TV: Turn on</div>
            <div>🎬 Plex: Open</div>
            <div>🔊 Sound System: Cinema mode</div>
          </div>
          <button onClick={() => executeScene('movie-night')}>Activate Scene</button>
        </div>
        <div className="scene-card">
          <h4>🎉 Party Mode</h4>
          <div className="scene-actions">
            <div>💡 Lights: Color party mode</div>
            <div>🎵 Spotify: Party playlist</div>
            <div>🔊 Volume: 75%</div>
            <div>🌈 Hue: Color cycling</div>
          </div>
          <button onClick={() => executeScene('party-mode')}>Activate Scene</button>
        </div>
        <div className="scene-card">
          <h4>🌙 Goodnight</h4>
          <div className="scene-actions">
            <div>💡 All lights: Off</div>
            <div>🚪 Doors: Lock</div>
            <div>🌡️ Thermostat: 68°F</div>
            <div>📱 Phone: Do not disturb</div>
          </div>
          <button onClick={() => executeScene('goodnight')}>Activate Scene</button>
        </div>
      </div>
      <div className="custom-scenes">
        <h4>Create Custom Scene</h4>
        <button className="create-scene-btn">+ Create New Scene</button>
      </div>
    </div>
  )

  const renderSecurityHub = () => (
    <div className="security-hub">
      <h3>🔒 Smart Home Security</h3>
      <div className="security-overview">
        <div className="security-status">
          <div className="status-indicator secure">🟢 System Armed</div>
          <div className="last-check">Last check: 2 minutes ago</div>
        </div>
        <div className="security-devices">
          <h4>Connected Security Devices</h4>
          <div className="device-list">
            <div className="security-device active">🚪 Front Door Lock - Locked</div>
            <div className="security-device active">📹 Driveway Camera - Recording</div>
            <div className="security-device active">🚨 Motion Sensor - Active</div>
            <div className="security-device active">🔔 Doorbell Camera - Online</div>
            <div className="security-device inactive">🪟 Window Sensors - 1 Open</div>
          </div>
        </div>
        <div className="security-actions">
          <h4>Security Controls</h4>
          <div className="security-buttons">
            <button className="security-btn arm">🔒 Arm System</button>
            <button className="security-btn disarm">🔓 Disarm System</button>
            <button className="security-btn away">🚗 Away Mode</button>
            <button className="security-btn panic">🚨 Panic Alert</button>
          </div>
        </div>
        <div className="recent-events">
          <h4>Recent Events</h4>
          <div className="event-log">
            <div className="event">15:32 - Motion detected: Living room</div>
            <div className="event">14:28 - Door opened: Front door</div>
            <div className="event">12:15 - System armed: Away mode</div>
          </div>
        </div>
      </div>
    </div>
  )

  // Helper functions for automation
  const toggleRule = (ruleId) => {
    setAutomationRules(rules => 
      rules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    )
    onOutput?.([`🤖 Automation rule ${ruleId} ${automationRules.find(r => r.id === ruleId)?.enabled ? 'disabled' : 'enabled'}`])
  }

  const createNewRule = () => {
    onOutput?.(['🤖 Opening automation rule creator...', 'Configure triggers and actions for your custom rule'])
  }

  const executeScene = (sceneName) => {
    const sceneMessages = {
      'good-morning': ['🌅 Activating Good Morning scene...', '💡 Gradually turning on lights', '☕ Starting coffee maker', '🌡️ Setting thermostat to 72°F'],
      'movie-night': ['🍿 Activating Movie Night scene...', '💡 Dimming lights to 20%', '📺 Turning on entertainment system'],
      'party-mode': ['🎉 Activating Party Mode...', '💡 Starting color party lighting', '🎵 Playing party playlist'],
      'goodnight': ['🌙 Activating Goodnight scene...', '💡 Turning off all lights', '🚪 Locking doors', '🌡️ Setting night temperature'],
      'away-mode': ['🚗 Activating Away Mode...', '🔒 Arming security system', '🌡️ Setting eco temperature', '💡 Random lighting pattern'],
      'work-focus': ['💼 Activating Work Focus...', '💡 Bright task lighting', '🔇 Silencing notifications', '🌡️ Optimal temperature']
    }
    onOutput?.(sceneMessages[sceneName] || [`✅ Activating ${sceneName} scene...`])
  }

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
            🏠 Dashboard
          </button>
          <button
            className={activeService === 'automation' ? 'active' : ''}
            onClick={() => setActiveService('automation')}
          >
            🤖 Automation
          </button>
          <button
            className={activeService === 'energy' ? 'active' : ''}
            onClick={() => setActiveService('energy')}
          >
            ⚡ Energy
          </button>
          <button
            className={activeService === 'scenes' ? 'active' : ''}
            onClick={() => setActiveService('scenes')}
          >
            🎭 Scenes
          </button>
          <button
            className={activeService === 'security' ? 'active' : ''}
            onClick={() => setActiveService('security')}
          >
            🔒 Security
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
          {activeService === 'dashboard' && renderDashboard()}
          {activeService === 'automation' && renderAutomation()}
          {activeService === 'energy' && renderEnergyDashboard()}
          {activeService === 'scenes' && renderSceneManagement()}
          {activeService === 'security' && renderSecurityHub()}
          {Object.keys(services).includes(activeService) && renderServiceControl()}
        </div>
      </div>
    </div>
  )
}

export default Stepdaddy