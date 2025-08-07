import { Alert } from 'react-native';

const API_BASE = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin';

class AdminApiService {
  constructor() {
    this.baseURL = API_BASE;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async makeRequest(endpoint, options = {}, onError) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        credentials: 'include',
        ...options,
      };

      const response = await fetch(url, config);
      if (!response.ok) {
        let errorText = '';
        try { errorText = await response.text(); } catch {}
        const errorMsg = `HTTP ${response.status}: ${response.statusText} - ${errorText}`;
        console.error(`Admin API Error (${endpoint}):`, errorMsg);
        if (onError) onError({ status: response.status, message: errorMsg });
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (error) {
      console.error(`Admin API Exception (${endpoint}):`, error);
      if (onError) onError({ status: 0, message: error.message });
      throw error;
    }
  }

  // Dashboard & Analytics
  async getDashboardAnalytics() {
    return this.makeRequest('/analytics/dashboard');
  }

  async getPerformanceMetrics() {
    return this.makeRequest('/analytics/performance');
  }

  async getUserAnalytics() {
    return this.makeRequest('/analytics/users');
  }

  async getRevenueAnalytics() {
    return this.makeRequest('/analytics/revenue');
  }

  async getBookingAnalytics() {
    return this.makeRequest('/analytics/bookings');
  }

  async getOrderAnalytics() {
    return this.makeRequest('/analytics/orders');
  }

  // User Management
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUserStatistics() {
    return this.makeRequest('/users/statistics');
  }

  async getUserById(userId) {
    return this.makeRequest(`/users/${userId}`);
  }

  async updateUserStatus(userId, status) {
    return this.makeRequest(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async deleteUser(userId) {
    try {
      return await this.makeRequest(`/users/${userId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error.message);
      throw error;
    }
  }

  async getUserActivityReport() {
    return this.makeRequest('/users/activity-report');
  }

  // Accommodation Management
  async getAccommodations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/accommodations${queryString ? `?${queryString}` : ''}`);
  }

  async getAccommodationStatistics() {
    return this.makeRequest('/accommodations/statistics');
  }

  async approveAccommodation(accommodationId) {
    return this.makeRequest(`/accommodations/${accommodationId}/approve`, {
      method: 'PUT'
    });
  }

  async rejectAccommodation(accommodationId, reason = '') {
    return this.makeRequest(`/accommodations/${accommodationId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  async deleteAccommodation(accommodationId) {
    try {
      return await this.makeRequest(`/accommodations/${accommodationId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Failed to delete accommodation ${accommodationId}:`, error.message);
      throw error;
    }
  }

  // Food Service Management
  async getFoodServices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/food-services${queryString ? `?${queryString}` : ''}`);
  }

  async getFoodProviders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/food-providers${queryString ? `?${queryString}` : ''}`);
  }

  async getFoodProviderStatistics() {
    return this.makeRequest('/food-providers/statistics');
  }

  async getFoodProviderAnalytics() {
    return this.makeRequest('/food-providers/analytics');
  }

  async getFoodServiceStatistics() {
    return this.makeRequest('/food-services/statistics');
  }

  async getFoodServiceReports() {
    return this.makeRequest('/food-services/reports');
  }

  async approveFoodService(serviceId) {
    return this.makeRequest(`/food-services/${serviceId}/approve`, {
      method: 'PUT'
    });
  }

  async rejectFoodService(serviceId, reason = '') {
    return this.makeRequest(`/food-services/${serviceId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  // Booking Management
  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/bookings${queryString ? `?${queryString}` : ''}`);
  }

  async getBookingById(bookingId) {
    return this.makeRequest(`/bookings/${bookingId}`);
  }

  async cancelBooking(bookingId) {
    return this.makeRequest(`/bookings/${bookingId}/cancel`, {
      method: 'PUT'
    });
  }

  // Order Management
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrderById(orderId) {
    return this.makeRequest(`/orders/${orderId}`);
  }

  // Financial Management
  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getPaymentStatistics() {
    return this.makeRequest('/payments/statistics');
  }

  async getCommissions() {
    return this.makeRequest('/commissions');
  }

  // Content Moderation
  async getContentReports() {
    return this.makeRequest('/content/reports');
  }

  async getReviewQueue() {
    return this.makeRequest('/content/review-queue');
  }

  async getModerationStatistics() {
    return this.makeRequest('/content/statistics');
  }

  // System Administration
  async getSystemHealth() {
    return this.makeRequest('/system/health');
  }

  async getSystemPerformance() {
    return this.makeRequest('/system/performance');
  }

  async getSystemLogs() {
    return this.makeRequest('/system/logs');
  }

  async createSystemBackup() {
    return this.makeRequest('/system/backup', {
      method: 'POST'
    });
  }

  // Configuration
  async getPlatformConfig() {
    return this.makeRequest('/config/platform');
  }

  async updatePlatformConfig(config) {
    return this.makeRequest('/config/platform', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  // Export & Reports
  async exportUsers(format = 'csv') {
    return this.makeRequest(`/export/users?format=${format}`);
  }

  async exportBookings(format = 'csv') {
    return this.makeRequest(`/export/bookings?format=${format}`);
  }

  async exportTransactions(format = 'csv') {
    return this.makeRequest(`/export/transactions?format=${format}`);
  }

  // Notifications
  async sendBroadcastNotification(notification) {
    return this.makeRequest('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(notification)
    });
  }

  async sendTargetedNotification(notification) {
    return this.makeRequest('/notifications/targeted', {
      method: 'POST',
      body: JSON.stringify(notification)
    });
  }

  // Test Runner
  async testEndpoint(endpoint, method = 'GET', body = null) {
    const options = { method };
    if (body) {
      options.body = JSON.stringify(body);
    }
    return this.makeRequest(endpoint, options);
  }

  // Error Handler
  handleError(error, context = '') {
    console.error(`Admin API Error${context ? ` (${context})` : ''}:`, error);
    
    let message = 'An error occurred while processing your request.';
    
    if (error.message.includes('401')) {
      message = 'Authentication failed. Please login again.';
    } else if (error.message.includes('403')) {
      message = 'You do not have permission to perform this action.';
    } else if (error.message.includes('404')) {
      message = 'The requested resource was not found.';
    } else if (error.message.includes('500')) {
      message = 'Server error. Please try again later.';
    } else if (error.message.includes('Network')) {
      message = 'Network error. Please check your connection.';
    }

    Alert.alert('Error', message);
    throw error;
  }
}

// Create singleton instance
const adminApiService = new AdminApiService();

export default adminApiService; 