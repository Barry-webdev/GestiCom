import api from '@/lib/api';

export const fundEntryService = {
  async getAll(params?: { category?: string; partner?: string; startDate?: string; endDate?: string; search?: string }) {
    const response = await api.get('/fund-entries', { params });
    return response.data;
  },
  async getById(id: string) {
    const response = await api.get(`/fund-entries/${id}`);
    return response.data;
  },
  async create(data: any) {
    const response = await api.post('/fund-entries', data);
    return response.data;
  },
  async update(id: string, data: any) {
    const response = await api.put(`/fund-entries/${id}`, data);
    return response.data;
  },
  async delete(id: string) {
    const response = await api.delete(`/fund-entries/${id}`);
    return response.data;
  },
  async getStats(period?: 'day' | 'month' | 'year') {
    const response = await api.get('/fund-entries/stats/summary', { params: { period } });
    return response.data;
  },
};
