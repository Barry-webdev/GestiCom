import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notification.service';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getAll(true);
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      // Silencieux — pas de toast pour les notifications
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAlerts = useCallback(async () => {
    try {
      await notificationService.getAlerts();
      await loadNotifications();
    } catch {
      // Silencieux
    }
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try { await notificationService.markAsRead(id); } catch { loadNotifications(); }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try { await notificationService.markAllAsRead(); } catch { loadNotifications(); }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    try { await notificationService.delete(id); } catch { loadNotifications(); }
  };

  useEffect(() => {
    loadNotifications();
    checkAlerts();

    // Polling toutes les 5 minutes au lieu de 30 secondes
    const interval = setInterval(checkAlerts, 5 * 60_000);
    return () => clearInterval(interval);
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, refresh: loadNotifications };
}
