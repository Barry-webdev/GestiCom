/**
 * Service de synchronisation offline complet.
 * - Pré-charge toutes les données dans IndexedDB quand on est en ligne
 * - Sert depuis IndexedDB quand offline
 * - Synchronise les actions en attente au retour en ligne
 */
import { cacheData, getCachedData, getPendingActions, markActionSynced, clearSyncedActions, updateLastSync, getLastSync } from './offline-storage';
import api from './api';
import { toast } from 'sonner';

const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 minutes

/**
 * Pré-charge toutes les données critiques dans IndexedDB.
 * Appelé une fois après le login ou si le cache est trop vieux.
 */
export async function preloadOfflineData(): Promise<void> {
  if (!navigator.onLine) return;

  const lastSync = await getLastSync();
  const isStale = Date.now() - lastSync > CACHE_MAX_AGE;
  if (!isStale) return; // Cache encore frais, pas besoin de recharger

  try {
    const [products, clients, suppliers, sales] = await Promise.all([
      api.get('/products').then(r => r.data.data ?? []),
      api.get('/clients').then(r => r.data.data ?? []),
      api.get('/suppliers').then(r => r.data.data ?? []),
      api.get('/sales').then(r => r.data.data ?? []),
    ]);

    await Promise.all([
      cacheData('products', products),
      cacheData('clients', clients),
      cacheData('suppliers', suppliers),
      cacheData('sales', sales),
    ]);

    await updateLastSync();
    console.log('✅ Données offline mises à jour dans IndexedDB');
  } catch (err) {
    console.warn('⚠️ Impossible de pré-charger les données offline:', err);
  }
}

/**
 * Récupère les données depuis IndexedDB si offline,
 * sinon depuis l'API (et met à jour IndexedDB).
 */
export async function getDataWithFallback<T>(
  entity: 'products' | 'clients' | 'suppliers' | 'sales',
  apiFn: () => Promise<T[]>
): Promise<T[]> {
  if (!navigator.onLine) {
    // Offline → IndexedDB
    const cached = await getCachedData(entity);
    return cached as T[];
  }

  try {
    const data = await apiFn();
    // Mettre à jour IndexedDB en arrière-plan
    cacheData(entity, data as any[]).catch(() => {});
    return data;
  } catch (err: any) {
    // Erreur réseau → fallback IndexedDB
    if (!err.response || err.code === 'ERR_NETWORK') {
      const cached = await getCachedData(entity);
      return cached as T[];
    }
    throw err;
  }
}

/**
 * Synchronise toutes les actions en attente avec le serveur.
 * Appelé automatiquement au retour en ligne.
 */
export async function syncOfflineActions(): Promise<void> {
  if (!navigator.onLine) return;

  const pending = await getPendingActions();
  if (pending.length === 0) return;

  toast.info(`Synchronisation de ${pending.length} action(s) en attente...`);

  const endpoints: Record<string, string> = {
    product: '/products',
    client: '/clients',
    supplier: '/suppliers',
    sale: '/sales',
    stock: '/stock',
  };

  let success = 0;
  let errors = 0;

  for (const action of pending) {
    try {
      const endpoint = endpoints[action.entity] ?? '';
      if (!endpoint) continue;

      switch (action.type) {
        case 'create': await api.post(endpoint, action.data); break;
        case 'update': await api.put(`${endpoint}/${action.data._id}`, action.data); break;
        case 'delete': await api.delete(`${endpoint}/${action.data._id}`); break;
      }

      await markActionSynced(action.id!);
      success++;
    } catch {
      errors++;
    }
  }

  await clearSyncedActions();
  await updateLastSync();

  if (success > 0) toast.success(`${success} action(s) synchronisée(s)`);
  if (errors > 0) toast.error(`${errors} action(s) en échec — réessayez plus tard`);

  // Recharger le cache IndexedDB après sync
  await preloadOfflineData();
  window.dispatchEvent(new CustomEvent('sync-complete'));
}
