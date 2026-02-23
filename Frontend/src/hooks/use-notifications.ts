import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notification.service';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getAll(false);
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAlerts = async () => {
    try {
      await notificationService.getAlerts();
      // Recharger les notifications après vérification des alertes
      loadNotifications();
    } catch (error) {
      console.error('Erreur vérification alertes:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.delete(id);
      loadNotifications();
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    checkAlerts();

    // Polling toutes les 30 secondes
    const interval = setInterval(() => {
      checkAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications,
  };
}
