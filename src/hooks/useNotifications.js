import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchNotifications,
  fetchNotificationStats,
  markNotificationsRead,
  markAllNotificationsRead,
  deleteNotification,
  bulkDeleteNotifications,
  getNotificationPreferences,
  updateNotificationPreferences
} from '../services/api';

/**
 * Custom hook for managing notifications
 * Provides notification data, loading states, and actions
 */
export const useNotifications = (options = {}) => {
  const {
    autoFetch = true,
    pollInterval = 30000, // 30 seconds
    filters = {}
  } = options;

  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Callers commonly pass `filters` as a fresh object literal on every
  // render (e.g. `useNotifications({ filters: { exclude_expired: 'true' } })`).
  // Keeping it out of loadNotifications' dependency array (and reading the
  // latest value via this ref instead) keeps loadNotifications' identity
  // stable across those renders - otherwise the polling effect below, which
  // depends on loadNotifications, tears down and restarts its interval on
  // every parent render instead of running on a steady cadence.
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // Fetch notifications
  const loadNotifications = useCallback(async (params = {}, signal = null) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = { ...filtersRef.current, ...params };
      const data = await fetchNotifications(queryParams, signal);
      setNotifications(data.notifications || data);
      return data;
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return null;
      }
      setError(err.message || 'Failed to load notifications');
      // Only log non-network errors (network errors are expected during rapid navigation)
      if (err.code !== 'ERR_NETWORK' && err.code !== 'ERR_INSUFFICIENT_RESOURCES') {
        console.error('Error fetching notifications:', err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats
  const loadStats = useCallback(async (signal = null) => {
    try {
      const data = await fetchNotificationStats(signal);
      setStats(data);
      setUnreadCount(data.unread || 0);
      return data;
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return null;
      }
      // Only log non-network errors
      if (err.code !== 'ERR_NETWORK' && err.code !== 'ERR_INSUFFICIENT_RESOURCES') {
        console.error('Error fetching notification stats:', err);
      }
      return null;
    }
  }, []);

  // Fetch preferences
  const loadPreferences = useCallback(async () => {
    try {
      const data = await getNotificationPreferences();
      setPreferences(data);
      return data;
    } catch (err) {
      console.error('Error fetching preferences:', err);
      return null;
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (notificationIds) => {
    try {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      await markNotificationsRead(ids);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          ids.includes(n.id) ? { ...n, read: true, read_at: new Date().toISOString() } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - ids.length));
      
      // Reload stats
      await loadStats();
      
      return true;
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      return false;
    }
  }, [loadStats]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      // Reload stats
      await loadStats();
      
      return true;
    } catch (err) {
      console.error('Error marking all as read:', err);
      return false;
    }
  }, [loadStats]);

  // Delete notification
  const removeNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Reload stats
      await loadStats();
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [loadStats]);

  // Bulk delete
  const bulkDelete = useCallback(async (notificationIds) => {
    try {
      await bulkDeleteNotifications(notificationIds);
      
      // Update local state
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
      
      // Reload stats
      await loadStats();
      
      return true;
    } catch (err) {
      console.error('Error bulk deleting notifications:', err);
      return false;
    }
  }, [loadStats]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      const data = await updateNotificationPreferences(newPreferences);
      setPreferences(data);
      return data;
    } catch (err) {
      console.error('Error updating preferences:', err);
      return null;
    }
  }, []);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      loadNotifications(),
      loadStats(),
      loadPreferences()
    ]);
  }, [loadNotifications, loadStats, loadPreferences]);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch]); // Only run on mount or when autoFetch changes

  // Set up polling if enabled (with backoff on errors and circuit breaker)
  useEffect(() => {
    if (!autoFetch || !pollInterval) return;

    let currentInterval = pollInterval;
    let consecutiveErrors = 0;
    const maxBackoffInterval = 300000; // 5 minutes max
    const maxConsecutiveErrors = 5; // Stop polling after 5 consecutive errors
    let isPolling = true; // Flag to stop polling on unmount or circuit breaker
    let timeoutId = null;
    let abortController = null; // To cancel in-flight requests

    const poll = async () => {
      // Stop if component unmounted or circuit breaker triggered
      if (!isPolling) return;

      // Nobody is looking at a hidden tab: skip this round and check again later
      if (typeof document !== 'undefined' && document.hidden) {
        timeoutId = setTimeout(poll, currentInterval);
        return;
      }

      // Cancel previous request if still in flight
      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();

      try {
        await Promise.all([
          loadNotifications({}, abortController.signal),
          loadStats(abortController.signal)
        ]);
        
        // Reset on success
        consecutiveErrors = 0;
        currentInterval = pollInterval;
      } catch (err) {
        // Ignore abort errors (component unmounted)
        if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
          return;
        }

        consecutiveErrors++;
        
        // Check for network errors (ERR_INSUFFICIENT_RESOURCES, ERR_NETWORK)
        const isNetworkError = err.code === 'ERR_NETWORK' || 
                             err.code === 'ERR_INSUFFICIENT_RESOURCES' ||
                             err.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
                             err.message?.includes('Network Error');
        
        // Circuit breaker: Stop polling after too many consecutive errors
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.warn(`Circuit breaker triggered: Too many consecutive errors (${consecutiveErrors}). Stopping polling.`);
          isPolling = false;
          return;
        }

        // Handle rate limiting or network errors with exponential backoff
        if (err.response?.status === 429 || err.message?.includes('429') || isNetworkError) {
          // Exponential backoff: 30s -> 60s -> 120s -> 240s -> 300s (max)
          currentInterval = Math.min(currentInterval * 2, maxBackoffInterval);
          console.warn(`${isNetworkError ? 'Network error' : 'Rate limited'}. Backing off to ${currentInterval/1000}s polling interval`);
          
          // For network errors, pause longer
          if (isNetworkError) {
            currentInterval = Math.max(currentInterval, 60000); // At least 1 minute for network errors
          }
        }
      } finally {
        // Only schedule next poll if still polling
        if (isPolling) {
          timeoutId = setTimeout(() => {
            poll();
          }, currentInterval);
        }
      }
    };

    // Initial poll after a short delay to avoid immediate flood
    timeoutId = setTimeout(() => {
      poll();
    }, 1000);

    // Cleanup function
    return () => {
      isPolling = false; // Stop all polling
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (abortController) {
        abortController.abort();
      }
    };
  }, [autoFetch, pollInterval, loadNotifications, loadStats]);

  return {
    notifications,
    stats,
    preferences,
    loading,
    error,
    unreadCount,
    loadNotifications,
    loadStats,
    loadPreferences,
    markAsRead,
    markAllAsRead,
    removeNotification,
    bulkDelete,
    updatePreferences,
    refresh
  };
};

export default useNotifications;

