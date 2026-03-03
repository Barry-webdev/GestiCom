# 📱 Mode Offline - GestiStock

## Vue d'ensemble

GestiStock supporte maintenant le **mode offline complet** avec synchronisation automatique. L'application fonctionne même sans connexion internet et synchronise automatiquement toutes les modifications dès que la connexion revient.

## Fonctionnalités

### ✅ Ce qui fonctionne hors ligne

1. **Consultation des données**
   - Produits
   - Clients
   - Fournisseurs
   - Ventes
   - Toutes les données sont mises en cache localement

2. **Modifications**
   - Créer de nouveaux produits, clients, fournisseurs
   - Modifier des données existantes
   - Supprimer des éléments
   - Enregistrer des ventes
   - Toutes les actions sont stockées et synchronisées automatiquement

3. **Synchronisation automatique**
   - Détection automatique de la reconnexion
   - Synchronisation en arrière-plan
   - Notifications de progression
   - Gestion des conflits

### 🔄 Comment ça marche

#### 1. Cache local (IndexedDB)
Toutes les données sont stockées localement dans le navigateur:
- `products` - Liste des produits
- `clients` - Liste des clients
- `suppliers` - Liste des fournisseurs
- `sales` - Liste des ventes
- `pendingActions` - Actions en attente de synchronisation

#### 2. Queue de synchronisation
Quand vous êtes hors ligne, toutes vos actions sont enregistrées:
```typescript
{
  type: 'create' | 'update' | 'delete',
  entity: 'product' | 'client' | 'supplier' | 'sale',
  data: {...},
  timestamp: 1234567890,
  synced: false
}
```

#### 3. Synchronisation automatique
Dès que la connexion revient:
1. Détection automatique du retour en ligne
2. Envoi de toutes les actions en attente au serveur
3. Mise à jour du cache local avec les données du serveur
4. Notification de succès

## Utilisation dans le code

### Hook `useOfflineData`

```typescript
import { useOfflineData } from '@/hooks/use-offline-data';

function MyComponent() {
  const {
    data,           // Données (cache ou API)
    loading,        // État de chargement
    error,          // Erreur éventuelle
    refresh,        // Recharger les données
    create,         // Créer un élément
    update,         // Mettre à jour
    remove,         // Supprimer
    isOnline,       // Statut de connexion
  } = useOfflineData('products', '/products');

  // Créer un produit (fonctionne online et offline)
  const handleCreate = async () => {
    await create({
      name: 'Nouveau produit',
      price: 10000,
      // ...
    });
  };

  return (
    <div>
      {!isOnline && <p>Mode hors ligne</p>}
      {/* ... */}
    </div>
  );
}
```

### Hook `useOnlineStatus`

```typescript
import { useOnlineStatus } from '@/hooks/use-online-status';

function StatusIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();

  return (
    <div>
      {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
      {wasOffline && '⚠️ Synchronisation en cours...'}
    </div>
  );
}
```

## Composants

### `OnlineStatusBanner`
Banner en haut de l'écran qui affiche:
- 🟢 Statut de connexion (en ligne/hors ligne)
- 📊 Nombre d'actions en attente
- ⏳ Progression de la synchronisation

Automatiquement intégré dans `MainLayout`.

## API

### `offline-storage.ts`

```typescript
// Initialiser la base de données
await initDB();

// Mettre en cache des données
await cacheData('products', productsArray);

// Récupérer des données du cache
const products = await getCachedData('products');

// Ajouter une action en attente
await addPendingAction('create', 'product', productData);

// Récupérer les actions non synchronisées
const pending = await getPendingActions();

// Marquer comme synchronisé
await markActionSynced(actionId);

// Vider le cache
await clearCache();
```

### `sync-manager.ts`

```typescript
// Synchroniser toutes les actions en attente
await syncPendingActions();

// Rafraîchir toutes les données depuis le serveur
await refreshAllData();

// Wrapper pour requêtes avec support offline
const result = await offlineRequest(
  () => api.post('/products', data),
  fallbackData,
  {
    type: 'create',
    entity: 'product',
    data: data
  }
);
```

## Scénarios d'utilisation

### Scénario 1: Vente hors ligne
1. Le vendeur perd la connexion internet
2. Il enregistre une vente normalement
3. La vente est stockée localement
4. Quand la connexion revient, la vente est automatiquement envoyée au serveur
5. Le stock est mis à jour sur le serveur

### Scénario 2: Consultation hors ligne
1. L'utilisateur consulte les produits
2. Perd la connexion
3. Peut toujours voir tous les produits (depuis le cache)
4. Peut chercher, filtrer, trier normalement

### Scénario 3: Modifications multiples hors ligne
1. Connexion perdue
2. Crée 3 nouveaux produits
3. Modifie 2 clients
4. Supprime 1 fournisseur
5. Toutes ces actions sont en queue
6. À la reconnexion, les 6 actions sont synchronisées dans l'ordre

## Avantages

✅ **Fiabilité**: L'app fonctionne même sans internet
✅ **Performance**: Chargement instantané depuis le cache
✅ **UX**: Pas de blocage, l'utilisateur peut toujours travailler
✅ **Synchronisation**: Automatique et transparente
✅ **Guinée-ready**: Parfait pour les zones avec connexion instable

## Limitations

⚠️ **Conflits**: Si deux utilisateurs modifient la même donnée offline, le dernier synchronisé gagne
⚠️ **Stockage**: Limité par le quota du navigateur (généralement 50MB+)
⚠️ **Sécurité**: Les données sont stockées localement (chiffrées par le navigateur)

## Tests

Pour tester le mode offline:

1. **Chrome DevTools**:
   - F12 → Network tab
   - Cocher "Offline"

2. **Tester la synchronisation**:
   - Passer en mode offline
   - Créer/modifier des données
   - Vérifier le banner "X actions en attente"
   - Repasser en ligne
   - Vérifier la synchronisation automatique

## Prochaines améliorations possibles

- 🔄 Résolution de conflits intelligente
- 📊 Statistiques de synchronisation
- 🔐 Chiffrement des données locales
- 📱 Service Worker pour PWA
- 🔔 Notifications push pour la sync
