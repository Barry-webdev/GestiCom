import api from '@/lib/api';

export const notificationService = {
  async getAll(unreadOnly = false) {
    const response = await api.get('/notifications', {
      params: { unreadOnly },
    });
    return response.data;
  },

  async getAlerts() {
    const response = await api.get('/notifications/alerts');
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
