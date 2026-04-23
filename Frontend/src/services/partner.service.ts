import api from '@/lib/api';

export const partnerService = {
  async getAll(params?: { search?: string }) {
    const response = await api.get('/partners', { params });
    return response.data;
  },
  async getById(id: string) {
    const response = await api.get(`/partners/${id}`);
    return response.data;
  },
  async create(data: any) {
    const response = await api.post('/partners', data);
    return response.data;
  },
  async update(id: string, data: any) {
    const response = await api.put(`/partners/${id}`, data);
    return response.data;
  },
  async delete(id: string) {
    const response = await api.delete(`/partners/${id}`);
    return response.data;
  },
};
