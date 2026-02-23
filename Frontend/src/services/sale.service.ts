import api from '@/lib/api';

export interface SaleItem {
  product: string;
  quantity: number;
}

export interface SaleFormData {
  client: string;
  items: SaleItem[];
  paymentMethod: string;
  notes?: string;
}

export const saleService = {
  async getAll(params?: { search?: string; status?: string; startDate?: string; endDate?: string }) {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  async create(data: SaleFormData) {
    const response = await api.post('/sales', data);
    return response.data;
  },

  async update(id: string, data: { status?: string; notes?: string }) {
    const response = await api.put(`/sales/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/sales/stats/summary');
    return response.data;
  },
};
