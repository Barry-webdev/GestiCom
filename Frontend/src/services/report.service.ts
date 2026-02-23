import api from '@/lib/api';

export const reportService = {
  async getMonthlyReport(year?: number) {
    const response = await api.get('/reports/monthly', {
      params: { year },
    });
    return response.data;
  },

  async getStockEvolution(period: 'week' | 'month' = 'week') {
    const response = await api.get('/reports/stock-evolution', {
      params: { period },
    });
    return response.data;
  },

  async getDailyReport(date?: string) {
    const response = await api.get('/reports/daily', {
      params: { date },
    });
    return response.data;
  },

  async getProductReport() {
    const response = await api.get('/reports/products');
    return response.data;
  },

  async getCategoryReport() {
    const response = await api.get('/reports/categories');
    return response.data;
  },

  async getClientReport(clientId?: string) {
    const response = await api.get('/reports/clients', {
      params: { clientId },
    });
    return response.data;
  },

  async getInventoryReport() {
    const response = await api.get('/reports/inventory');
    return response.data;
  },
};
