// Backend Status Monitor - Centralized backend health checking
class BackendStatusService {
    constructor() {
        this.isBackendAvailable = false;
        this.lastCheckTime = 0;
        this.checkInterval = 60000; // Check every minute
        this.listeners = new Set();
    }

    // Add listener for backend status changes
    addListener(callback) {
        this.listeners.add(callback);
    }

    // Remove listener
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    // Notify all listeners of status change
    notifyListeners(status) {
        this.listeners.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Error in backend status listener:', error);
            }
        });
    }

    // Check backend health
    async checkBackendHealth() {
        const now = Date.now();
        
        // Don't check too frequently
        if (now - this.lastCheckTime < this.checkInterval) {
            return this.isBackendAvailable;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            // Use the main API endpoint which we know exists
            const response = await fetch('https://staykaru-backend-60ed08adb2a7.herokuapp.com/api', {
                method: 'GET',
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' }
            });

            clearTimeout(timeoutId);
            
            // Consider any response (even 404) as backend being available
            // Only consider 500+ errors as backend being unavailable
            const newStatus = response.status < 500;
            
            if (newStatus !== this.isBackendAvailable) {
                console.log(`🔄 Backend status changed: ${newStatus ? 'Available' : 'Unavailable'}`);
                this.isBackendAvailable = newStatus;
                this.notifyListeners(newStatus);
            }
            
            this.lastCheckTime = now;
            return this.isBackendAvailable;
            
        } catch (error) {
            console.warn('⚠️ Backend health check failed:', error.message);
            
            if (this.isBackendAvailable) {
                console.log('🔄 Backend status changed: Unavailable');
                this.isBackendAvailable = false;
                this.notifyListeners(false);
            }
            
            this.lastCheckTime = now;
            return false;
        }
    }

    // Get current status without checking
    getCurrentStatus() {
        return this.isBackendAvailable;
    }

    // Force a health check
    async forceCheck() {
        this.lastCheckTime = 0;
        return await this.checkBackendHealth();
    }
}

export default new BackendStatusService();
