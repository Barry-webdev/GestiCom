# 📚 Documentation des Composants Frontend - GestiStock

## 🎯 Vue d'ensemble

Cette documentation liste tous les composants frontend créés pour l'application GestiStock, avec leurs fonctionnalités et leur utilisation.

---

## 📝 Formulaires (Modals)

### ProductFormModal
**Chemin:** `src/components/products/ProductFormModal.tsx`

Formulaire de création/modification de produits avec validation Zod.

**Props:**
- `open`: boolean - État d'ouverture du modal
- `onOpenChange`: (open: boolean) => void - Callback de changement d'état
- `product?`: Product - Produit à modifier (optionnel)
- `onSubmit`: (data: ProductFormData) => void - Callback de soumission

**Champs:**
- Nom du produit
- Catégorie (select)
- Unité (select)
- Quantité en stock
- Seuil d'alerte
- Prix d'achat
- Prix de vente
- Fournisseur (select)

---

### ClientFormModal
**Chemin:** `src/components/clients/ClientFormModal.tsx`

Formulaire de gestion des clients.

**Champs:**
- Nom complet
- Téléphone (format guinéen +224)
- Email (optionnel)
- Adresse

---

### SupplierFormModal
**Chemin:** `src/components/suppliers/SupplierFormModal.tsx`

Formulaire de gestion des fournisseurs.

**Champs:**
- Nom de l'entreprise
- Personne de contact
- Téléphone
- Email (optionnel)
- Adresse

---

### SaleFormModal
**Chemin:** `src/components/sales/SaleFormModal.tsx`

Formulaire de création de vente avec panier de produits.

**Fonctionnalités:**
- Ajout de produits au panier
- Gestion des quantités
- Calcul automatique des totaux
- Sélection du client
- Mode de paiement

---

### StockMovementModal
**Chemin:** `src/components/stock/StockMovementModal.tsx`

Formulaire d'enregistrement des mouvements de stock (entrées/sorties).

**Props:**
- `type`: "entry" | "exit" - Type de mouvement

**Champs:**
- Produit (select)
- Quantité
- Raison (select)
- Commentaire (optionnel)

---

### UserFormModal
**Chemin:** `src/components/settings/UserFormModal.tsx`

Formulaire de gestion des utilisateurs.

**Champs:**
- Nom complet
- Email
- Téléphone
- Rôle (admin, gestionnaire, vendeur, lecteur)
- Mot de passe

---

## 🔔 Composants Partagés

### DeleteConfirmDialog
**Chemin:** `src/components/shared/DeleteConfirmDialog.tsx`

Dialog de confirmation de suppression.

**Props:**
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `onConfirm`: () => void
- `title?`: string
- `description?`: string
- `itemName?`: string

---

### EmptyState
**Chemin:** `src/components/shared/EmptyState.tsx`

Composant d'état vide (quand aucune donnée).

**Props:**
- `icon`: LucideIcon
- `title`: string
- `description`: string
- `actionLabel?`: string
- `onAction?`: () => void

---

### LoadingSpinner
**Chemin:** `src/components/shared/LoadingSpinner.tsx`

Indicateur de chargement.

**Props:**
- `size?`: "sm" | "md" | "lg"
- `text?`: string
- `fullScreen?`: boolean

---

### SearchBar
**Chemin:** `src/components/shared/SearchBar.tsx`

Barre de recherche réutilisable avec bouton de réinitialisation.

**Props:**
- `value`: string
- `onChange`: (value: string) => void
- `placeholder?`: string
- `className?`: string

---

### TablePagination
**Chemin:** `src/components/shared/TablePagination.tsx`

Composant de pagination pour les tableaux.

**Props:**
- `currentPage`: number
- `totalPages`: number
- `pageSize`: number
- `totalItems`: number
- `onPageChange`: (page: number) => void
- `onPageSizeChange`: (size: number) => void

---

### TableSkeleton
**Chemin:** `src/components/shared/TableSkeleton.tsx`

Skeletons de chargement pour tableaux et cartes.

**Composants:**
- `TableSkeleton` - Skeleton de tableau
- `CardSkeleton` - Skeleton de carte
- `StatCardSkeleton` - Skeleton de carte statistique

---

## 📱 Layout

### MobileSidebar
**Chemin:** `src/components/layout/MobileSidebar.tsx`

Menu latéral mobile avec Sheet.

**Props:**
- `open`: boolean
- `onOpenChange`: (open: boolean) => void

---

### Header (mis à jour)
**Chemin:** `src/components/layout/Header.tsx`

En-tête avec bouton hamburger pour mobile.

**Props:**
- `title`: string
- `subtitle?`: string
- `onMenuClick?`: () => void

---

### MainLayout (mis à jour)
**Chemin:** `src/components/layout/MainLayout.tsx`

Layout principal avec gestion du menu mobile.

---

## 📄 Pages

### Login
**Chemin:** `src/pages/Login.tsx`

Page de connexion avec validation.

**Fonctionnalités:**
- Formulaire email/mot de passe
- Affichage/masquage du mot de passe
- Se souvenir de moi
- Compte de test affiché

---

### ProductDetail
**Chemin:** `src/pages/ProductDetail.tsx`

Page de détail d'un produit.

**Sections:**
- Informations principales
- Graphique d'évolution du stock
- Mouvements récents
- Statistiques
- Valeur en stock

---

### SaleDetail
**Chemin:** `src/pages/SaleDetail.tsx`

Page de détail d'une vente.

**Sections:**
- En-tête de la vente
- Informations client
- Liste des articles
- Totaux
- Informations de paiement
- Actions (facture, reçu)

---

## 🎣 Hooks Personnalisés

### useTableFilters
**Chemin:** `src/hooks/use-table-filters.ts`

Hook pour gérer la recherche, le filtrage et la pagination.

**Paramètres:**
- `data`: T[] - Données à filtrer
- `searchFields`: (keyof T)[] - Champs de recherche
- `initialPageSize?`: number

**Retour:**
- `filteredData` - Données filtrées
- `paginatedData` - Données paginées
- `searchQuery` - Requête de recherche
- `setSearchQuery` - Modifier la recherche
- `filters` - Filtres actifs
- `setFilter` - Modifier un filtre
- `resetFilters` - Réinitialiser
- `currentPage`, `totalPages`, `pageSize` - Pagination

---

## 🛠️ Utilitaires

### toast-utils.ts
**Chemin:** `src/lib/toast-utils.ts`

Fonctions utilitaires pour les notifications toast.

**Fonctions:**
- `showSuccessToast(message, description?)`
- `showErrorToast(message, description?)`
- `showWarningToast(message, description?)`
- `showInfoToast(message, description?)`
- `showLoadingToast(message)`
- `dismissToast(toastId)`

---

### format.ts
**Chemin:** `src/lib/format.ts`

Fonctions de formatage.

**Fonctions:**
- `formatPrice(value)` - Formate en GNF
- `formatNumber(value)` - Séparateurs de milliers
- `formatPhone(phone)` - Format guinéen
- `formatDate(date)` - Format français
- `formatDateTime(date)` - Date + heure
- `formatRelativeTime(date)` - "Il y a X min"
- `formatPercentage(value)` - Pourcentage
- `calculateMargin(buyPrice, sellPrice)` - Marge
- `calculateProfit(buyPrice, sellPrice)` - Profit
- `generateSaleId()` - ID de vente
- `isValidGuineanPhone(phone)` - Validation
- `formatExportFilename(prefix)` - Nom de fichier

---

### constants.ts
**Chemin:** `src/lib/constants.ts`

Constantes de l'application.

**Exports:**
- `PRODUCT_CATEGORIES` - Catégories de produits
- `PRODUCT_UNITS` - Unités de mesure
- `PAYMENT_METHODS` - Modes de paiement
- `USER_ROLES` - Rôles utilisateurs
- `ENTRY_REASONS` / `EXIT_REASONS` - Raisons de mouvement
- `PRODUCT_STATUS` / `SALE_STATUS` / `CLIENT_STATUS` - Statuts
- `DATE_RANGES` - Plages de dates
- `PAGE_SIZES` - Tailles de page
- `CURRENCY` - Devise
- `PHONE_PREFIX` / `PHONE_REGEX` - Téléphone
- `STORAGE_KEYS` - Clés localStorage
- `API_ENDPOINTS` - Endpoints API
- `CHART_COLORS` - Couleurs graphiques

---

### types/index.ts
**Chemin:** `src/types/index.ts`

Types TypeScript pour tout le projet.

**Types principaux:**
- `Product`, `Client`, `Supplier`, `User`
- `Sale`, `SaleItem`, `StockMovement`
- `DashboardStats`
- `TableFilters`, `PaginationState`
- Tous les `FormData` types
- `ApiResponse`, `ApiError`

---

## 🎨 Charte Graphique

### Couleurs principales
- **Primary (Navy):** `hsl(222 47% 20%)` - #1C2A47
- **Secondary (Gold):** `hsl(38 92% 50%)` - #F59E0B
- **Success (Green):** `hsl(152 69% 40%)`
- **Warning (Amber):** `hsl(38 92% 50%)`
- **Destructive (Red):** `hsl(0 84% 60%)`
- **Info (Blue):** `hsl(199 89% 48%)`

### Classes CSS personnalisées
- `.btn-accent` - Bouton avec gradient gold
- `.btn-primary` - Bouton primary navy
- `.stat-card` - Carte statistique
- `.sidebar-item` - Item de menu
- `.badge-success` / `.badge-warning` / `.badge-destructive`
- `.input-field` - Champ de saisie
- `.table-row` - Ligne de tableau

---

## 📱 Responsive

Tous les composants sont responsive avec breakpoints:
- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md/lg)
- **Desktop:** > 1024px (lg/xl)

**Fonctionnalités responsive:**
- Menu mobile avec hamburger
- Grilles adaptatives (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Tableaux scrollables horizontalement
- Boutons empilés sur mobile (flex-col sm:flex-row)
- Textes cachés sur mobile (hidden sm:inline)

---

## ✅ Prochaines étapes

Pour rendre l'application complètement fonctionnelle:

1. **Backend API** - Créer les endpoints REST
2. **Intégration API** - Connecter les formulaires au backend
3. **Authentification** - JWT et protection des routes
4. **State Management** - Utiliser React Query pour le cache
5. **Export PDF/Excel** - Implémenter les exports
6. **Tests** - Tests unitaires et E2E

---

## 📞 Support

Pour toute question sur l'utilisation des composants, consultez:
- Le code source avec commentaires
- Les types TypeScript pour l'autocomplétion
- Les exemples d'utilisation dans les pages existantes
