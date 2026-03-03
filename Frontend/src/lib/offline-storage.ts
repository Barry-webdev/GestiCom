// Système de stockage offline avec IndexedDB
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GestiStockDB extends DBSchema {
  products: {
    key: string;
    value: any;
  };
  clients: {
    key: string;
    value: any;
  };
  suppliers: {
    key: string;
    value: any;
  };
  sales: {
    key: string;
    value: any;
  };
  pendingActions: {
    key: number;
    value: {
      id?: number;
      type: 'create' | 'update' | 'delete';
      entity: 'product' | 'client' | 'supplier' | 'sale' | 'stock';
      data: any;
      timestamp: number;
      synced: boolean;
    };
    indexes: { 'by-synced': boolean };
  };
  metadata: {
    key: string;
    value: {
      lastSync: number;
      version: number;
    };
  };
}

let db: IDBPDatabase<GestiStockDB> | null = null;

export async function initDB() {
  if (db) return db;

  db = await openDB<GestiStockDB>('gestistock-db', 1, {
    upgrade(db) {
      // Stores pour les données
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('clients')) {
        db.createObjectStore('clients', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('suppliers')) {
        db.createObjectStore('suppliers', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('sales')) {
        db.createObjectStore('sales', { keyPath: '_id' });
      }
      
      // Store pour les actions en attente de sync
      if (!db.objectStoreNames.contains('pendingActions')) {
        const store = db.createObjectStore('pendingActions', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('by-synced', 'synced');
      }

      // Metadata
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata');
      }
    },
  });

  return db;
}

// Sauvegarder des données en cache
export async function cacheData(storeName: keyof Omit<GestiStockDB, 'pendingActions' | 'metadata'>, data: any[]) {
  const database = await initDB();
  const tx = database.transaction(storeName, 'readwrite');
  
  await Promise.all([
    ...data.map(item => tx.store.put(item)),
    tx.done,
  ]);
}

// Récupérer des données du cache
export async function getCachedData(storeName: keyof Omit<GestiStockDB, 'pendingActions' | 'metadata'>) {
  const database = await initDB();
  return await database.getAll(storeName);
}

// Récupérer un élément spécifique
export async function getCachedItem(storeName: keyof Omit<GestiStockDB, 'pendingActions' | 'metadata'>, id: string) {
  const database = await initDB();
  return await database.get(storeName, id);
}

// Ajouter une action en attente de synchronisation
export async function addPendingAction(
  type: 'create' | 'update' | 'delete',
  entity: 'product' | 'client' | 'supplier' | 'sale' | 'stock',
  data: any
) {
  const database = await initDB();
  await database.add('pendingActions', {
    type,
    entity,
    data,
    timestamp: Date.now(),
    synced: false,
  });
}

// Récupérer les actions non synchronisées
export async function getPendingActions() {
  const database = await initDB();
  const index = database.transaction('pendingActions').store.index('by-synced');
  return await index.getAll(false);
}

// Marquer une action comme synchronisée
export async function markActionSynced(id: number) {
  const database = await initDB();
  const action = await database.get('pendingActions', id);
  if (action) {
    action.synced = true;
    await database.put('pendingActions', action);
  }
}

// Supprimer les actions synchronisées
export async function clearSyncedActions() {
  const database = await initDB();
  const actions = await database.getAll('pendingActions');
  const tx = database.transaction('pendingActions', 'readwrite');
  
  await Promise.all([
    ...actions.filter(a => a.synced).map(a => tx.store.delete(a.id!)),
    tx.done,
  ]);
}

// Mettre à jour la dernière synchronisation
export async function updateLastSync() {
  const database = await initDB();
  await database.put('metadata', {
    lastSync: Date.now(),
    version: 1,
  }, 'sync-info');
}

// Récupérer la dernière synchronisation
export async function getLastSync() {
  const database = await initDB();
  const metadata = await database.get('metadata', 'sync-info');
  return metadata?.lastSync || 0;
}

// Vider tout le cache
export async function clearCache() {
  const database = await initDB();
  await Promise.all([
    database.clear('products'),
    database.clear('clients'),
    database.clear('suppliers'),
    database.clear('sales'),
    database.clear('pendingActions'),
  ]);
}
