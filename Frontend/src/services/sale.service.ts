import api from '@/lib/api';

export interface SaleItem {
  product: string;
  quantity: number;
}

export interface SaleFormData {
  client: string;
  items: SaleItem[];
  initialPayment?: number;
  paymentMethod: string;
  dueDate?: string;
  notes?: string;
}

export interface PaymentData {
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export const saleService = {
  async getAll(params?: { search?: string; status?: string; paymentStatus?: string; startDate?: string; endDate?: string }) {
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

  async update(id: string, data: { status?: string; dueDate?: string; notes?: string }) {
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

  async getOutstanding() {
    const response = await api.get('/sales/outstanding');
    return response.data;
  },

  async addPayment(id: string, data: PaymentData) {
    const response = await api.post(`/sales/${id}/payments`, data);
    return response.data;
  },
};
