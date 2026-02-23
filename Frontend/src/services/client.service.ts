import api from '@/lib/api';

export interface ClientFormData {
  name: string;
  phone: string;
  address: string;
  email?: string;
  status?: 'active' | 'inactive' | 'vip';
}

export const clientService = {
  async getAll(params?: { search?: string; status?: string }) {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  async create(data: ClientFormData) {
    const response = await api.post('/clients', data);
    return response.data;
  },

  async update(id: string, data: Partial<ClientFormData>) {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  async getVIPClients() {
    const response = await api.get('/clients/vip/list');
    return response.data;
  },
};
