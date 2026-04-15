import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Cache mémoire simple pour éviter les requêtes répétées
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 secondes

export function getCached(key: string) {
  const entry = memoryCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  return null;
}

export function setCache(key: string, data: any) {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(pattern?: string) {
  if (!pattern) { memoryCache.clear(); return; }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) memoryCache.delete(key);
  }
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s timeout max
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Erreur réseau (backend inaccessible) → servir le cache localStorage
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    if (isNetworkError) {
      const url = error.config?.url ?? '';
      // Trouver la clé de cache correspondante à l'URL
      const cacheKeyMap: Record<string, string> = {
        '/products': 'cache_products',
        '/clients': 'cache_clients',
        '/suppliers': 'cache_suppliers',
        '/sales': 'cache_sales',
        '/stock': 'cache_stock',
        '/dashboard/stats': 'cache_dashboard-stats',
        '/sales/stats/summary': 'cache_sales-stats',
        '/stock/stats/summary': 'cache_stock-stats',
      };

      const matchedKey = Object.keys(cacheKeyMap).find(k => url.includes(k));
      if (matchedKey) {
        try {
          const raw = localStorage.getItem(cacheKeyMap[matchedKey]);
          if (raw) {
            const { data } = JSON.parse(raw);
            // Retourner une fausse réponse axios avec les données en cache
            return Promise.resolve({
              data: { success: true, data, count: Array.isArray(data) ? data.length : undefined, _fromCache: true },
              status: 200,
              statusText: 'OK (cache)',
              headers: {},
              config: error.config,
            });
          }
        } catch { /* ignore */ }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
