import { useEffect, useRef, useCallback } from 'react';
import foodProviderApiService from '../../services/foodProviderApiService.js';

export default function useFoodProviderRealtime({ onOrder, onNotification, pollInterval = 30000 }) {
  const wsRef = useRef(null);
  const pollingRef = useRef(null);
  const isActiveRef = useRef(true);

  // Memoize callbacks to prevent infinite loops - FIXED
  const memoizedOnOrder = useCallback((data) => {
    if (onOrder && typeof onOrder === 'function') {
      onOrder(data);
    }
  }, [onOrder]);
  
  const memoizedOnNotification = useCallback((data) => {
    if (onNotification && typeof onNotification === 'function') {
      onNotification(data);
    }
  }, [onNotification]);

  useEffect(() => {
    isActiveRef.current = true;
    
    const startPolling = () => {
      // Clear any existing polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }

      console.log('🔄 Starting real-time polling for food provider dashboard (every 30s)');

      // Initial fetch
      fetchData();

      // Set up polling
      pollingRef.current = setInterval(() => {
        if (isActiveRef.current) {
          fetchData();
        }
      }, pollInterval);
    };

    const fetchData = async () => {
      try {
        if (!isActiveRef.current) return;

        // Fetch orders with error handling
        if (memoizedOnOrder) {
          try {
            const ordersData = await foodProviderApiService.getOrders({ limit: 10 });
            if (isActiveRef.current) {
              memoizedOnOrder(ordersData.orders || ordersData || []);
            }
          } catch (error) {
            console.warn('Real-time orders fetch failed:', error.message);
            if (isActiveRef.current) {
              memoizedOnOrder([]);
            }
          }
        }

        // Fetch notifications with error handling
        if (memoizedOnNotification) {
          try {
            const notificationsData = await foodProviderApiService.getNotifications();
            if (isActiveRef.current) {
              memoizedOnNotification(notificationsData.notifications || notificationsData || []);
            }
          } catch (error) {
            console.warn('Real-time notifications fetch failed:', error.message);
            if (isActiveRef.current) {
              memoizedOnNotification([]);
            }
          }
        }
      } catch (error) {
        console.warn('Real-time data fetch error:', error.message);
      }
    };

    // Start polling after a short delay to prevent immediate conflicts
    const timeout = setTimeout(startPolling, 1000);
    
    return () => {
      isActiveRef.current = false;
      clearTimeout(timeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [pollInterval]); // Only depend on pollInterval

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
    };
  }, []);
} 