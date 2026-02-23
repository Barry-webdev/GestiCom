import api from '@/lib/api';

export interface StockMovementFormData {
  type: 'entry' | 'exit';
  product: string;
  quantity: number;
  reason: string;
  comment?: string;
}

export const stockService = {
  async getAll(params?: { search?: string; type?: string; startDate?: string; endDate?: string }) {
    const response = await api.get('/stock', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/stock/${id}`);
    return response.data;
  },

  async create(data: StockMovementFormData) {
    const response = await api.post('/stock', data);
    return response.data;
  },

  async update(id: string, data: { comment?: string }) {
    const response = await api.put(`/stock/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/stock/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/stock/stats/summary');
    return response.data;
  },
};
