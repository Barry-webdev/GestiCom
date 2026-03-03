// Gestionnaire de synchronisation offline/online
import { 
  getPendingActions, 
  markActionSynced, 
  clearSyncedActions,
  updateLastSync,
  cacheData,
  addPendingAction
} from './offline-storage';
import api from './api';
import { toast } from 'sonner';

let isSyncing = false;

export async function syncPendingActions() {
  if (isSyncing) return;
  
  isSyncing = true;
  const pendingActions = await getPendingActions();

  if (pendingActions.length === 0) {
    isSyncing = false;
    return;
  }

  toast.info(`Synchronisation de ${pendingActions.length} action(s)...`);

  let successCount = 0;
  let errorCount = 0;

  for (const action of pendingActions) {
    try {
      const endpoint = getEndpoint(action.entity);
      
      switch (action.type) {
        case 'create':
          await api.post(endpoint, action.data);
          break;
        case 'update':
          await api.put(`${endpoint}/${action.data._id}`, action.data);
          break;
        case 'delete':
          await api.delete(`${endpoint}/${action.data._id}`);
          break;
      }

      await markActionSynced(action.id!);
      successCount++;
    } catch (error) {
      console.error('Erreur sync action:', error);
      errorCount++;
    }
  }

  await clearSyncedActions();
  await updateLastSync();

  if (successCount > 0) {
    toast.success(`${successCount} action(s) synchronisée(s)`);
  }
  if (errorCount > 0) {
    toast.error(`${errorCount} action(s) en échec`);
  }

  isSyncing = false;

  // Recharger les données depuis le serveur
  await refreshAllData();
  
  // Notifier que la sync est terminée
  window.dispatchEvent(new CustomEvent('sync-complete'));
}

function getEndpoint(entity: string): string {
  const endpoints: Record<string, string> = {
    product: '/products',
    client: '/clients',
    supplier: '/suppliers',
    sale: '/sales',
    stock: '/stock/movements',
  };
  return endpoints[entity] || '';
}

// Rafraîchir toutes les données depuis le serveur
export async function refreshAllData() {
  try {
    const [products, clients, suppliers, sales] = await Promise.all([
      api.get('/products').then(r => r.data.data),
      api.get('/clients').then(r => r.data.data),
      api.get('/suppliers').then(r => r.data.data),
      api.get('/sales').then(r => r.data.data),
    ]);

    await Promise.all([
      cacheData('products', products),
      cacheData('clients', clients),
      cacheData('suppliers', suppliers),
      cacheData('sales', sales),
    ]);

    await updateLastSync();
  } catch (error) {
    console.error('Erreur refresh data:', error);
  }
}

// Wrapper pour les requêtes avec support offline
export async function offlineRequest<T>(
  requestFn: () => Promise<T>,
  fallbackData: T,
  onOffline?: {
    type: 'create' | 'update' | 'delete';
    entity: 'product' | 'client' | 'supplier' | 'sale' | 'stock';
    data: any;
  }
): Promise<T> {
  try {
    // Essayer la requête en ligne
    const result = await requestFn();
    return result;
  } catch (error: any) {
    // Si erreur réseau et qu'on a une action offline
    if (!navigator.onLine || error.code === 'ERR_NETWORK') {
      if (onOffline) {
        await addPendingAction(onOffline.type, onOffline.entity, onOffline.data);
        toast.warning('Action enregistrée. Sera synchronisée à la reconnexion.');
      }
      return fallbackData;
    }
    throw error;
  }
}
