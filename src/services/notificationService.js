import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.loadNotifications();
  }

  // Load notifications from storage
  async loadNotifications() {
    try {
      const stored = await AsyncStorage.getItem('user_notifications');
      this.notifications = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  // Save notifications to storage
  async saveNotifications() {
    try {
      await AsyncStorage.setItem('user_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.warn('Failed to save notifications:', error);
    }
  }

  // Create notification
  async createNotification(type, title, message, data = {}) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type, // 'booking', 'order', 'payment', 'general', 'cancellation'
      title,
      message,
      data,
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    };

    this.notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    await this.saveNotifications();
    return notification;
  }

  // Get all notifications
  async getNotifications() {
    await this.loadNotifications();
    return this.notifications.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get unread notifications count
  async getUnreadCount() {
    await this.loadNotifications();
    return this.notifications.filter(n => !n.read).length;
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    await this.loadNotifications();
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.saveNotifications();
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    await this.loadNotifications();
    this.notifications.forEach(n => n.read = true);
    await this.saveNotifications();
  }

  // Delete notification
  async deleteNotification(notificationId) {
    await this.loadNotifications();
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    await this.saveNotifications();
  }

  // Booking-related notifications
  async notifyBookingCreated(booking) {
    return await this.createNotification(
      'booking',
      '🏠 Booking Confirmed',
      `Your accommodation booking has been confirmed for ${booking.accommodation?.name || 'property'}.`,
      { bookingId: booking._id || booking.id, booking }
    );
  }

  async notifyBookingConfirmed(booking) {
    return await this.createNotification(
      'booking',
      '🏠 Booking Confirmed',
      `Your accommodation booking has been confirmed for ${booking.accommodation?.name || 'property'}.`,
      { bookingId: booking._id || booking.id, booking }
    );
  }

  async notifyBookingCancelled(booking, reason = '') {
    return await this.createNotification(
      'cancellation',
      '❌ Booking Cancelled',
      `Your booking for ${booking.accommodation?.name || 'property'} has been cancelled. ${reason}`,
      { bookingId: booking._id || booking.id, booking, reason }
    );
  }

  async notifyBookingUpdated(booking, changes) {
    return await this.createNotification(
      'booking',
      '📝 Booking Updated',
      `Your booking for ${booking.accommodation?.name || 'property'} has been updated.`,
      { bookingId: booking._id || booking.id, booking, changes }
    );
  }

  // Order-related notifications
  async notifyOrderPlaced(order) {
    return await this.createNotification(
      'order',
      '🍽️ Order Placed',
      `Your order from ${order.provider?.name || 'restaurant'} has been placed successfully.`,
      { orderId: order._id || order.id, order }
    );
  }

  async notifyOrderStatusChanged(order, newStatus) {
    const statusMessages = {
      confirmed: '✅ Order Confirmed',
      preparing: '👨‍🍳 Order Being Prepared',
      ready: '📦 Order Ready for Pickup',
      out_for_delivery: '🚗 Order Out for Delivery',
      delivered: '✅ Order Delivered',
      cancelled: '❌ Order Cancelled'
    };

    const title = statusMessages[newStatus] || '📱 Order Update';
    const message = `Your order from ${order.provider?.name || 'restaurant'} is now ${newStatus}.`;

    return await this.createNotification(
      'order',
      title,
      message,
      { orderId: order._id || order.id, order, status: newStatus }
    );
  }

  async notifyOrderCancelled(order, reason = '') {
    return await this.createNotification(
      'cancellation',
      '❌ Order Cancelled',
      `Your order from ${order.provider?.name || 'restaurant'} has been cancelled. ${reason}`,
      { orderId: order._id || order.id, order, reason }
    );
  }

  // Payment-related notifications
  async notifyPaymentSuccess(amount, type, reference) {
    return await this.createNotification(
      'payment',
      '💳 Payment Successful',
      `Your payment of Rs. ${amount} for ${type} has been processed successfully.`,
      { amount, type, reference }
    );
  }

  async notifyPaymentFailed(amount, type, reason) {
    return await this.createNotification(
      'payment',
      '❌ Payment Failed',
      `Your payment of Rs. ${amount} for ${type} has failed. ${reason}`,
      { amount, type, reason }
    );
  }

  // General notifications
  async notifyWelcome() {
    return await this.createNotification(
      'general',
      '🎉 Welcome to StayKaru!',
      'Welcome to StayKaru! Discover amazing accommodations and delicious food options.',
      {}
    );
  }

  async notifyPromotion(title, message, promo = {}) {
    return await this.createNotification(
      'general',
      `🎁 ${title}`,
      message,
      { promotion: promo }
    );
  }

  async notifyMaintenance(title, message, duration) {
    return await this.createNotification(
      'general',
      `🔧 ${title}`,
      message,
      { maintenance: true, duration }
    );
  }

  // Recent activity notifications
  async notifyActivity(activity) {
    const activityMessages = {
      profile_updated: '👤 Profile Updated',
      preferences_changed: '⚙️ Preferences Updated',
      review_submitted: '⭐ Review Submitted',
      favorite_added: '❤️ Added to Favorites',
      search_saved: '🔍 Search Saved'
    };

    const title = activityMessages[activity.type] || '📱 Activity Update';
    
    return await this.createNotification(
      'general',
      title,
      activity.message || 'Your account activity has been updated.',
      { activity }
    );
  }
}

export const notificationService = new NotificationService();
