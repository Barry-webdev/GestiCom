import api from '@/lib/api';

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: 'admin' | 'gestionnaire' | 'vendeur' | 'lecteur';
  status?: 'active' | 'inactive';
}

export const userService = {
  async getAll() {
    const response = await api.get('/users');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(data: UserFormData) {
    const response = await api.post('/users', data);
    return response.data;
  },

  async update(id: string, data: Partial<UserFormData>) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async resetPassword(id: string, newPassword: string) {
    const response = await api.put(`/users/${id}/reset-password`, { newPassword });
    return response.data;
  },

  async toggleStatus(id: string) {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data;
  },
};
