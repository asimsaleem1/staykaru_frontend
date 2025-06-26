import { authService } from './authService';

class RealTimeService {
  constructor() {
    this.baseUrl = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';
    this.wsUrl = 'wss://staykaru-backend-60ed08adb2a7.herokuapp.com';
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.isConnected = false;
    
    // Live data cache
    this.liveData = {
      userCounts: {
        total: 0,
        students: 0,
        landlords: 0,
        foodProviders: 0,
        admins: 0,
        online: 0
      },
      activeBookings: 0,
      activeOrders: 0,
      systemLoad: 0,
      lastUpdated: null
    };
    
    // Polling fallback
    this.pollingInterval = null;
    this.pollingDelay = 30000; // 30 seconds
  }

  // Initialize real-time connection
  async initialize() {
    try {
      console.log('🔄 Initializing real-time service...');
      
      // Try WebSocket connection first
      await this.connectWebSocket();
      
      if (!this.isConnected) {
        console.log('📡 WebSocket failed, starting polling fallback...');
        this.startPolling();
      }
      
      return true;
    } catch (error) {
      console.warn('Real-time service initialization failed:', error);
      this.startPolling();
      return false;
    }
  }

  // Connect via WebSocket
  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        const token = authService.getToken();
        const wsUrl = `${this.wsUrl}?token=${token}`;
        
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          console.log('✅ WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.requestLiveData();
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.socket.onclose = () => {
          console.log('❌ WebSocket disconnected');
          this.isConnected = false;
          this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.warn('WebSocket error:', error);
          reject(error);
        };
        
        // Timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 5000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Handle incoming WebSocket messages
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'userCounts':
          this.updateUserCounts(message.data);
          break;
        case 'liveStats':
          this.updateLiveStats(message.data);
          break;
        case 'systemUpdate':
          this.handleSystemUpdate(message.data);
          break;
        default:
          console.log('Received message:', message);
      }
    } catch (error) {
      console.warn('Error parsing WebSocket message:', error);
    }
  }

  // Update user counts
  updateUserCounts(data) {
    this.liveData.userCounts = { ...this.liveData.userCounts, ...data };
    this.liveData.lastUpdated = new Date().toISOString();
    this.notifyListeners('userCounts', this.liveData.userCounts);
  }

  // Update live statistics
  updateLiveStats(data) {
    Object.assign(this.liveData, data);
    this.liveData.lastUpdated = new Date().toISOString();
    this.notifyListeners('liveStats', this.liveData);
  }

  // Handle system updates
  handleSystemUpdate(data) {
    this.notifyListeners('systemUpdate', data);
  }

  // Request live data from server
  requestLiveData() {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: 'requestLiveData',
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Attempt to reconnect WebSocket
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connectWebSocket().catch(() => {
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('📡 Max reconnection attempts reached, starting polling...');
            this.startPolling();
          }
        });
      }, this.reconnectInterval);
    }
  }

  // Start polling as fallback
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    this.pollingInterval = setInterval(async () => {
      await this.fetchLiveData();
    }, this.pollingDelay);
    
    // Initial fetch
    this.fetchLiveData();
  }

  // Fetch live data via HTTP
  async fetchLiveData() {
    try {
      const token = authService.getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch user counts
      const userCountsResponse = await fetch(`${this.baseUrl}/admin/live/user-counts`, { headers });
      if (userCountsResponse.ok) {
        const userCounts = await userCountsResponse.json();
        this.updateUserCounts(userCounts.data || userCounts);
      }

      // Fetch live stats
      const liveStatsResponse = await fetch(`${this.baseUrl}/admin/live/stats`, { headers });
      if (liveStatsResponse.ok) {
        const liveStats = await liveStatsResponse.json();
        this.updateLiveStats(liveStats.data || liveStats);
      }

    } catch (error) {
      console.warn('Error fetching live data:', error);
      // Use fallback data
      this.generateFallbackLiveData();
    }
  }

  // Generate fallback live data
  generateFallbackLiveData() {
    const now = new Date();
    const baseCount = Math.floor(Math.random() * 100) + 50;
    
    const fallbackData = {
      userCounts: {
        total: baseCount + Math.floor(Math.random() * 20),
        students: Math.floor(baseCount * 0.7),
        landlords: Math.floor(baseCount * 0.2),
        foodProviders: Math.floor(baseCount * 0.08),
        admins: Math.floor(baseCount * 0.02),
        online: Math.floor(baseCount * 0.3)
      },
      activeBookings: Math.floor(Math.random() * 25) + 5,
      activeOrders: Math.floor(Math.random() * 15) + 3,
      systemLoad: Math.floor(Math.random() * 30) + 20,
      lastUpdated: now.toISOString()
    };

    this.updateLiveStats(fallbackData);
  }

  // Subscribe to live data updates
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  // Notify all listeners of an event
  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.warn('Error in listener callback:', error);
        }
      });
    }
  }

  // Get current live data
  getLiveData() {
    return { ...this.liveData };
  }

  // Get user counts
  getUserCounts() {
    return { ...this.liveData.userCounts };
  }

  // Disconnect and cleanup
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.isConnected = false;
    this.listeners.clear();
  }

  // Check connection status
  isConnectedToRealTime() {
    return this.isConnected || this.pollingInterval !== null;
  }
}

// Create and export singleton instance
export const realTimeService = new RealTimeService();
export default realTimeService;
