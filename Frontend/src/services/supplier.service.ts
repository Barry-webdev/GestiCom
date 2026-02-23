import api from '@/lib/api';

export interface SupplierFormData {
  name: string;
  phone: string;
  address: string;
  contact: string;
  email?: string;
  status?: 'active' | 'inactive';
}

export const supplierService = {
  async getAll(params?: { search?: string; status?: string }) {
    const response = await api.get('/suppliers', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  async create(data: SupplierFormData) {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  async update(id: string, data: Partial<SupplierFormData>) {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
};
