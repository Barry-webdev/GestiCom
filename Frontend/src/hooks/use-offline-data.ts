import { useState, useEffect } from 'react';
import { getCachedData, cacheData, addPendingAction } from '@/lib/offline-storage';
import { useOnlineStatus } from './use-online-status';
import api from '@/lib/api';

type EntityType = 'products' | 'clients' | 'suppliers' | 'sales';

export function useOfflineData<T>(
  entityType: EntityType,
  apiEndpoint: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useOnlineStatus();

  // Charger les données (cache ou API)
  const loadData = async () => {
    try {
      setLoading(true);
      
      if (isOnline) {
        // En ligne: charger depuis l'API
        const response = await api.get(apiEndpoint);
        const apiData = response.data.data || response.data;
        setData(apiData);
        
        // Mettre en cache
        await cacheData(entityType, apiData);
      } else {
        // Hors ligne: charger depuis le cache
        const cachedData = await getCachedData(entityType);
        setData(cachedData as T[]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error(`Erreur chargement ${entityType}:`, err);
      
      // En cas d'erreur, essayer le cache
      try {
        const cachedData = await getCachedData(entityType);
        setData(cachedData as T[]);
        setError('Données chargées depuis le cache');
      } catch (cacheErr) {
        setError(err.message || 'Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  // Créer un élément
  const create = async (item: Partial<T>) => {
    try {
      if (isOnline) {
        const response = await api.post(apiEndpoint, item);
        await loadData();
        return response.data;
      } else {
        // Hors ligne: ajouter à la queue
        const tempId = `temp_${Date.now()}`;
        const tempItem = { ...item, _id: tempId } as T;
        
        await addPendingAction('create', entityType.slice(0, -1) as any, item);
        setData(prev => [...prev, tempItem]);
        
        return { success: true, data: tempItem };
      }
    } catch (err: any) {
      throw err;
    }
  };

  // Mettre à jour un élément
  const update = async (id: string, item: Partial<T>) => {
    try {
      if (isOnline) {
        const response = await api.put(`${apiEndpoint}/${id}`, item);
        await loadData();
        return response.data;
      } else {
        // Hors ligne: ajouter à la queue
        await addPendingAction('update', entityType.slice(0, -1) as any, { ...item, _id: id });
        setData(prev => prev.map(d => (d as any)._id === id ? { ...d, ...item } : d));
        
        return { success: true };
      }
    } catch (err: any) {
      throw err;
    }
  };

  // Supprimer un élément
  const remove = async (id: string) => {
    try {
      if (isOnline) {
        await api.delete(`${apiEndpoint}/${id}`);
        await loadData();
      } else {
        // Hors ligne: ajouter à la queue
        await addPendingAction('delete', entityType.slice(0, -1) as any, { _id: id });
        setData(prev => prev.filter(d => (d as any)._id !== id));
      }
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    loadData();
  }, [isOnline]);

  // Écouter les événements de sync
  useEffect(() => {
    const handleSyncComplete = () => {
      loadData();
    };

    window.addEventListener('sync-complete', handleSyncComplete);
    return () => window.removeEventListener('sync-complete', handleSyncComplete);
  }, []);

  return {
    data,
    loading,
    error,
    refresh: loadData,
    create,
    update,
    remove,
    isOnline,
  };
}
