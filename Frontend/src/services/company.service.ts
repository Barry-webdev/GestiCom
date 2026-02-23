import api from '@/lib/api';

export interface CompanyFormData {
  name: string;
  phone: string;
  address: string;
  email?: string;
  logo?: string;
}

export const companyService = {
  async get() {
    const response = await api.get('/company');
    return response.data;
  },

  async update(data: CompanyFormData) {
    const response = await api.put('/company', data);
    return response.data;
  },
};
