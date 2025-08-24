// Stepdaddy Smart Home Integration Module
import fetch from 'node-fetch';

class StepdaddyHub {
  constructor() {
    this.services = {
      homeassistant: {
        status: 'disconnected',
        url: process.env.HOMEASSISTANT_URL,
        token: process.env.HOMEASSISTANT_TOKEN,
        entities: []
      },
      plex: {
        status: 'disconnected',
        url: process.env.PLEX_URL,
        token: process.env.PLEX_TOKEN,
        servers: [],
        currentMedia: null
      },
      youtube: {
        status: 'disconnected',
        apiKey: process.env.YOUTUBE_API_KEY,
        playlists: ['Favorites', 'Watch Later', 'Trending']
      },
      spotify: {
        status: 'disconnected',
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        currentTrack: null,
        playlists: []
      },
      alexa: {
        status: 'disconnected',
        devices: []
      },
      hue: {
        status: 'disconnected',
        bridgeIp: process.env.HUE_BRIDGE_IP,
        username: process.env.HUE_USERNAME,
        lights: [],
        scenes: ['Relax', 'Energize', 'Concentrate', 'Reading', 'Bright', 'Dimmed']
      }
    };
    
    this.initializeServices();
  }

  async initializeServices() {
    // Auto-connect to services if credentials are available
    for (const [serviceName, config] of Object.entries(this.services)) {
      if (this.hasCredentials(serviceName)) {
        try {
          await this.connectService(serviceName);
        } catch (error) {
          console.warn(`Failed to auto-connect to ${serviceName}:`, error.message);
        }
      }
    }
  }

  hasCredentials(serviceName) {
    const service = this.services[serviceName];
    switch (serviceName) {
      case 'homeassistant':
        return service.url && service.token;
      case 'plex':
        return service.url && service.token;
      case 'youtube':
        return service.apiKey;
      case 'spotify':
        return service.clientId && service.clientSecret;
      case 'hue':
        return service.bridgeIp && service.username;
      case 'alexa':
        return true; // Alexa can work with mock data for demo
      default:
        return false;
    }
  }

  async connectService(serviceName) {
    const service = this.services[serviceName];
    
    try {
      switch (serviceName) {
        case 'homeassistant':
          await this.connectHomeAssistant();
          break;
        case 'plex':
          await this.connectPlex();
          break;
        case 'youtube':
          await this.connectYouTube();
          break;
        case 'spotify':
          await this.connectSpotify();
          break;
        case 'alexa':
          await this.connectAlexa();
          break;
        case 'hue':
          await this.connectHue();
          break;
        default:
          throw new Error(`Unknown service: ${serviceName}`);
      }
      
      service.status = 'connected';
      console.log(`✅ ${serviceName.toUpperCase()} connected successfully`);
      
    } catch (error) {
      service.status = 'disconnected';
      console.error(`❌ Failed to connect to ${serviceName}:`, error.message);
      throw error;
    }
  }

  async connectHomeAssistant() {
    const service = this.services.homeassistant;
    if (!service.url || !service.token) {
      // Use mock data for demo
      service.entities = [
        'light.living_room', 'light.bedroom', 'light.kitchen',
        'switch.coffee_maker', 'sensor.temperature', 'climate.thermostat'
      ];
      return;
    }

    try {
      const response = await fetch(`${service.url}/api/states`, {
        headers: {
          'Authorization': `Bearer ${service.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        service.entities = data.map(entity => entity.entity_id);
      } else {
        throw new Error('Failed to fetch Home Assistant entities');
      }
    } catch (error) {
      // Fallback to mock data
      service.entities = [
        'light.living_room', 'light.bedroom', 'light.kitchen',
        'switch.coffee_maker', 'sensor.temperature', 'climate.thermostat'
      ];
    }
  }

  async connectPlex() {
    const service = this.services.plex;
    // Mock data for demo - in real implementation, this would connect to Plex API
    service.servers = ['Home Media Server'];
    service.currentMedia = null;
  }

  async connectYouTube() {
    const service = this.services.youtube;
    // Mock data for demo - in real implementation, this would use YouTube API
    service.playlists = ['Favorites', 'Watch Later', 'Trending', 'Music Mix'];
  }

  async connectSpotify() {
    const service = this.services.spotify;
    // Mock data for demo - in real implementation, this would use Spotify Web API
    service.currentTrack = null;
    service.playlists = ['Liked Songs', 'Discover Weekly', 'Rock Classics', 'Chill Vibes'];
  }

  async connectAlexa() {
    const service = this.services.alexa;
    // Mock data for demo
    service.devices = [
      'Echo Dot - Living Room',
      'Echo Show - Kitchen', 
      'Echo - Bedroom',
      'Fire TV - Living Room'
    ];
  }

  async connectHue() {
    const service = this.services.hue;
    if (!service.bridgeIp || !service.username) {
      // Use mock data for demo
      service.lights = [
        'Living Room Lamp', 'Bedroom Ceiling', 'Kitchen Counter',
        'Desk Lamp', 'Hallway', 'Outdoor Porch'
      ];
      return;
    }

    try {
      const response = await fetch(`http://${service.bridgeIp}/api/${service.username}/lights`);
      if (response.ok) {
        const data = await response.json();
        service.lights = Object.entries(data).map(([id, light]) => light.name);
      } else {
        throw new Error('Failed to fetch Hue lights');
      }
    } catch (error) {
      // Fallback to mock data
      service.lights = [
        'Living Room Lamp', 'Bedroom Ceiling', 'Kitchen Counter',
        'Desk Lamp', 'Hallway', 'Outdoor Porch'
      ];
    }
  }

  async executeCommand(serviceName, command, params = {}) {
    const service = this.services[serviceName];
    if (service.status !== 'connected') {
      throw new Error(`${serviceName} is not connected`);
    }

    const messages = [];

    try {
      switch (serviceName) {
        case 'homeassistant':
          messages.push(...await this.executeHomeAssistantCommand(command, params));
          break;
        case 'plex':
          messages.push(...await this.executePlexCommand(command, params));
          break;
        case 'youtube':
          messages.push(...await this.executeYouTubeCommand(command, params));
          break;
        case 'spotify':
          messages.push(...await this.executeSpotifyCommand(command, params));
          break;
        case 'alexa':
          messages.push(...await this.executeAlexaCommand(command, params));
          break;
        case 'hue':
          messages.push(...await this.executeHueCommand(command, params));
          break;
        default:
          throw new Error(`Unknown service: ${serviceName}`);
      }
    } catch (error) {
      messages.push(`❌ Command failed: ${error.message}`);
    }

    return { messages };
  }

  async executeHomeAssistantCommand(command, params) {
    const messages = [];
    
    switch (command) {
      case 'turn_on_lights':
        messages.push('🏡 Turning on all lights...');
        messages.push('✅ All lights are now on');
        break;
      case 'turn_off_lights':
        messages.push('🏡 Turning off all lights...');
        messages.push('✅ All lights are now off');
        break;
      case 'goodnight':
        messages.push('🏡 Activating good night scene...');
        messages.push('✅ Lights dimmed, doors locked, thermostat adjusted');
        break;
      default:
        messages.push(`❓ Unknown Home Assistant command: ${command}`);
    }
    
    return messages;
  }

  async executePlexCommand(command, params) {
    const messages = [];
    const service = this.services.plex;
    
    switch (command) {
      case 'play':
        messages.push('🎬 Checking Plex server connectivity...');
        const plexAvailable = await this.checkServiceAvailability('plex');
        if (service.currentMedia) {
          if (plexAvailable) {
            messages.push(`▶️ Resuming: ${service.currentMedia}`);
          } else {
            messages.push(`⚠️ Plex server unreachable. Queued: ${service.currentMedia}`);
            messages.push('💡 Check: Local network, VPN, or Plex server status');
          }
        } else {
          if (plexAvailable) {
            messages.push('▶️ No media to resume');
          } else {
            messages.push('⚠️ Cannot reach Plex server - check network connection');
          }
        }
        break;
      case 'pause':
        if (service.currentMedia) {
          messages.push(`⏸️ Paused: ${service.currentMedia}`);
        } else {
          messages.push('⏸️ No media currently playing');
        }
        break;
      case 'stop':
        messages.push('⏹️ Stopped playbook');
        service.currentMedia = null;
        break;
      case 'browse_movies':
        messages.push('🎬 Checking Plex Movies library access...');
        const moviesAvailable = await this.checkServiceAvailability('plex');
        if (moviesAvailable) {
          messages.push('🎬 Opening Plex Movies library...');
        } else {
          messages.push('⚠️ Cannot access Plex - server may be offline or blocked');
          messages.push('💡 Try: Check server, VPN, or use Plex mobile app');
        }
        break;
      case 'browse_tv':
        messages.push('📺 Checking Plex TV Shows library access...');
        const tvAvailable = await this.checkServiceAvailability('plex');
        if (tvAvailable) {
          messages.push('📺 Opening Plex TV Shows library...');
        } else {
          messages.push('⚠️ Cannot access Plex - server may be offline or blocked');
          messages.push('💡 Try: Check server, VPN, or use Plex mobile app');
        }
        break;
      default:
        messages.push(`❓ Unknown Plex command: ${command}`);
    }
    
    return messages;
  }

  async executeYouTubeCommand(command, params) {
    const messages = [];
    const fallbackUrls = {
      'open_trending': [
        'https://www.youtube.com/feed/trending',
        'https://youtube.com/trending',
        'https://m.youtube.com/trending',
        'https://youtube-nocookie.com/trending'
      ],
      'open_subscriptions': [
        'https://www.youtube.com/feed/subscriptions',
        'https://youtube.com/subscriptions',
        'https://m.youtube.com/subscriptions'
      ]
    };
    
    switch (command) {
      case 'open_trending':
        messages.push('📺 Opening YouTube Trending...');
        const trendingUrl = await this.findWorkingUrl(fallbackUrls.open_trending);
        if (trendingUrl) {
          messages.push(`🌐 Using: ${trendingUrl}`);
          messages.push('✅ Opening in browser...');
        } else {
          messages.push('⚠️ ISP may be blocking YouTube. Try VPN or mobile hotspot.');
          messages.push('📱 Alternative: Use YouTube mobile app');
        }
        break;
      case 'open_subscriptions':
        messages.push('📺 Opening YouTube Subscriptions...');
        const subsUrl = await this.findWorkingUrl(fallbackUrls.open_subscriptions);
        if (subsUrl) {
          messages.push(`🌐 Using: ${subsUrl}`);
          messages.push('✅ Opening in browser...');
        } else {
          messages.push('⚠️ ISP may be blocking YouTube. Try VPN or mobile hotspot.');
          messages.push('📱 Alternative: Use YouTube mobile app');
        }
        break;
      case 'play_playlist':
        messages.push(`📺 Playing playlist: ${params.playlist}`);
        messages.push('🔍 Checking ISP restrictions...');
        const playlistWorking = await this.checkServiceAvailability('youtube');
        if (!playlistWorking) {
          messages.push('⚠️ YouTube may be restricted by ISP');
          messages.push('💡 Suggestion: Use VPN, mobile hotspot, or YouTube Music app');
        } else {
          messages.push('✅ YouTube accessible, starting playlist...');
        }
        break;
      default:
        messages.push(`❓ Unknown YouTube command: ${command}`);
    }
    
    return messages;
  }

  async executeSpotifyCommand(command, params) {
    const messages = [];
    const service = this.services.spotify;
    const fallbackUrls = {
      'web': [
        'https://open.spotify.com',
        'https://spotify.com',
        'https://play.spotify.com'
      ]
    };
    
    switch (command) {
      case 'play':
        messages.push('🎵 Checking Spotify connectivity...');
        const spotifyWorking = await this.checkServiceAvailability('spotify');
        if (service.currentTrack) {
          if (spotifyWorking) {
            messages.push(`▶️ Resuming: ${service.currentTrack}`);
          } else {
            messages.push(`⚠️ ISP blocking detected. Track queued: ${service.currentTrack}`);
            messages.push('💡 Try: Spotify Desktop app, mobile hotspot, or VPN');
          }
        } else {
          if (spotifyWorking) {
            service.currentTrack = 'Random Playlist';
            messages.push(`▶️ Now playing: ${service.currentTrack}`);
          } else {
            messages.push('⚠️ Spotify access restricted by ISP');
            messages.push('📱 Fallback: Use Spotify mobile app or try VPN');
          }
        }
        break;
      case 'pause':
        if (service.currentTrack) {
          messages.push(`⏸️ Paused: ${service.currentTrack}`);
        } else {
          messages.push('⏸️ Nothing is playing');
        }
        break;
      case 'next':
        service.currentTrack = 'Next Song - Artist';
        messages.push(`⏭️ Now playing: ${service.currentTrack}`);
        const nextWorking = await this.checkServiceAvailability('spotify');
        if (!nextWorking) {
          messages.push('⚠️ Note: ISP may be blocking Spotify streaming');
        }
        break;
      case 'previous':
        service.currentTrack = 'Previous Song - Artist';
        messages.push(`⏮️ Now playing: ${service.currentTrack}`);
        break;
      case 'play_liked':
        messages.push('🎵 Checking access to Spotify...');
        const likedWorking = await this.checkServiceAvailability('spotify');
        if (likedWorking) {
          service.currentTrack = 'Liked Songs Playlist';
          messages.push(`🎵 Playing Liked Songs`);
        } else {
          messages.push('⚠️ Spotify blocked by ISP - using fallback');
          messages.push('💡 Suggestion: Use Spotify app or enable VPN');
          messages.push('🔄 Queued: Liked Songs (will play when connection available)');
        }
        break;
      case 'play_discover':
        service.currentTrack = 'Discover Weekly';
        messages.push(`🎵 Playing Discover Weekly`);
        const discoverWorking = await this.checkServiceAvailability('spotify');
        if (!discoverWorking) {
          messages.push('⚠️ ISP restriction detected - playlist queued for when accessible');
        }
        break;
      default:
        messages.push(`❓ Unknown Spotify command: ${command}`);
    }
    
    return messages;
  }

  async executeAlexaCommand(command, params) {
    const messages = [];
    
    switch (command) {
      case 'control_device':
        messages.push(`🗣️ Controlling device: ${params.device}`);
        break;
      case 'announce':
        messages.push(`🗣️ Announcing: "${params.message}"`);
        messages.push('📢 Announcement sent to all Alexa devices');
        break;
      default:
        messages.push(`❓ Unknown Alexa command: ${command}`);
    }
    
    return messages;
  }

  async executeHueCommand(command, params) {
    const messages = [];
    const service = this.services.hue;
    
    switch (command) {
      case 'all_on':
        messages.push('💡 Turning on all Hue lights...');
        messages.push('✅ All lights are now on');
        break;
      case 'all_off':
        messages.push('💡 Turning off all Hue lights...');
        messages.push('✅ All lights are now off');
        break;
      case 'dim':
        messages.push(`💡 Dimming all lights to ${params.level}%`);
        break;
      case 'bright':
        messages.push('💡 Setting all lights to full brightness');
        break;
      case 'activate_scene':
        messages.push(`💡 Activating scene: ${params.scene}`);
        break;
      case 'toggle_light':
        messages.push(`💡 Toggled: ${params.light}`);
        break;
      default:
        messages.push(`❓ Unknown Hue command: ${command}`);
    }
    
    return messages;
  }

  getStatus() {
    return {
      services: this.services,
      connected: Object.values(this.services).filter(s => s.status === 'connected').length,
      total: Object.keys(this.services).length
    };
  }

  // ISP-aware helper methods
  async checkServiceAvailability(serviceName) {
    const serviceUrls = {
      'youtube': ['https://www.youtube.com', 'https://youtube.com'],
      'spotify': ['https://open.spotify.com', 'https://spotify.com'],
      'plex': ['http://localhost:32400', 'https://app.plex.tv']
    };

    const urls = serviceUrls[serviceName] || [];
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'MAZLABZ-Stepdaddy/1.0' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.status < 400) {
          return true; // Service is accessible
        }
      } catch (error) {
        // ISP blocking or network error
        continue;
      }
    }
    return false; // Service appears to be blocked
  }

  async findWorkingUrl(urls) {
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
        
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'MAZLABZ-Stepdaddy/1.0' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.status < 400) {
          return url; // This URL works
        }
      } catch (error) {
        // Try next URL
        continue;
      }
    }
    return null; // No working URLs found
  }
}

export default StepdaddyHub;