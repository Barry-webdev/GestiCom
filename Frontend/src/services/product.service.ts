import api from '@/lib/api';
import type { Product, ProductFormData } from '@/types';

export const productService = {
  async getAll(params?: { search?: string; category?: string; status?: string }) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: ProductFormData) {
    const response = await api.post('/products', data);
    return response.data;
  },

  async update(id: string, data: Partial<ProductFormData>) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  async getLowStock() {
    const response = await api.get('/products/alerts/low-stock');
    return response.data;
  },
};
