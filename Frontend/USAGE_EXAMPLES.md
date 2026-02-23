# 📖 Exemples d'Utilisation des Composants

Ce guide montre comment utiliser les nouveaux composants créés dans vos pages.

---

## 🔹 Utiliser ProductFormModal

```tsx
import { useState } from "react";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { Button } from "@/components/ui/button";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";

function ProductsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSubmit = async (data) => {
    try {
      // TODO: Appel API
      console.log("Données du produit:", data);
      showSuccessToast("Produit ajouté avec succès");
    } catch (error) {
      showErrorToast("Erreur lors de l'ajout du produit");
    }
  };

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        Nouveau produit
      </Button>

      <ProductFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={selectedProduct}
        onSubmit={handleSubmit}
      />
    </>
  );
}
```

---

## 🔹 Utiliser useTableFilters Hook

```tsx
import { useTableFilters } from "@/hooks/use-table-filters";
import { SearchBar } from "@/components/shared/SearchBar";
import { TablePagination } from "@/components/shared/TablePagination";

function ProductsList() {
  const products = [
    { id: 1, name: "Riz", category: "Alimentaire", quantity: 45 },
    // ... plus de produits
  ];

  const {
    paginatedData,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    setCurrentPage,
    setPageSize,
  } = useTableFilters({
    data: products,
    searchFields: ["name", "category"],
    initialPageSize: 10,
  });

  return (
    <div>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Rechercher un produit..."
      />

      <table>
        {paginatedData.map((product) => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>{product.category}</td>
            <td>{product.quantity}</td>
          </tr>
        ))}
      </table>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
```

---

## 🔹 Utiliser DeleteConfirmDialog

```tsx
import { useState } from "react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { showSuccessToast } from "@/lib/toast-utils";

function ProductRow({ product }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      // TODO: Appel API
      console.log("Suppression du produit:", product.id);
      showSuccessToast("Produit supprimé");
    } catch (error) {
      showErrorToast("Erreur lors de la suppression");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setDeleteDialogOpen(true)}
      >
        Supprimer
      </Button>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={product.name}
      />
    </>
  );
}
```

---

## 🔹 Utiliser EmptyState

```tsx
import { EmptyState } from "@/components/shared/EmptyState";
import { Package } from "lucide-react";

function ProductsList({ products }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucun produit"
        description="Commencez par ajouter votre premier produit au catalogue"
        actionLabel="Ajouter un produit"
        onAction={() => setModalOpen(true)}
      />
    );
  }

  return (
    // ... liste des produits
  );
}
```

---

## 🔹 Utiliser LoadingSpinner

```tsx
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

function ProductsList() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement des produits..." />;
  }

  return (
    // ... liste des produits
  );
}

// Ou en plein écran
function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <LoadingSpinner fullScreen text="Chargement..." />}
      {/* Contenu de l'app */}
    </>
  );
}
```

---

## 🔹 Utiliser TableSkeleton

```tsx
import { TableSkeleton, StatCardSkeleton } from "@/components/shared/TableSkeleton";

function ProductsList() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <TableSkeleton rows={10} columns={6} />;
  }

  return (
    // ... tableau réel
  );
}

function Dashboard() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    // ... dashboard réel
  );
}
```

---

## 🔹 Utiliser les Fonctions de Formatage

```tsx
import {
  formatPrice,
  formatPhone,
  formatDate,
  formatRelativeTime,
  calculateMargin,
} from "@/lib/format";

function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>Prix: {formatPrice(product.sellPrice)}</p>
      <p>Marge: {calculateMargin(product.buyPrice, product.sellPrice)}</p>
    </div>
  );
}

function ClientCard({ client }) {
  return (
    <div>
      <h3>{client.name}</h3>
      <p>Tél: {formatPhone(client.phone)}</p>
      <p>Dernier achat: {formatRelativeTime(client.lastPurchase)}</p>
    </div>
  );
}
```

---

## 🔹 Utiliser les Notifications Toast

```tsx
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/toast-utils";

function ProductForm() {
  const handleSubmit = async (data) => {
    const toastId = showLoadingToast("Enregistrement en cours...");

    try {
      await saveProduct(data);
      dismissToast(toastId);
      showSuccessToast(
        "Produit enregistré",
        "Le produit a été ajouté au catalogue"
      );
    } catch (error) {
      dismissToast(toastId);
      showErrorToast(
        "Erreur",
        "Impossible d'enregistrer le produit"
      );
    }
  };

  const handleLowStock = () => {
    showWarningToast(
      "Stock bas",
      "Le stock de ce produit est en dessous du seuil"
    );
  };

  const handleInfo = () => {
    showInfoToast(
      "Information",
      "Les prix sont en Francs Guinéens (GNF)"
    );
  };

  return (
    // ... formulaire
  );
}
```

---

## 🔹 Utiliser les Constantes

```tsx
import {
  PRODUCT_CATEGORIES,
  PAYMENT_METHODS,
  USER_ROLES,
  formatPrice,
} from "@/lib/constants";
import { Select, SelectItem } from "@/components/ui/select";

function ProductForm() {
  return (
    <Select>
      {PRODUCT_CATEGORIES.map((category) => (
        <SelectItem key={category} value={category}>
          {category}
        </SelectItem>
      ))}
    </Select>
  );
}

function SaleForm() {
  return (
    <Select>
      {PAYMENT_METHODS.map((method) => (
        <SelectItem key={method} value={method}>
          {method}
        </SelectItem>
      ))}
    </Select>
  );
}
```

---

## 🔹 Utiliser les Types TypeScript

```tsx
import type { Product, Client, Sale } from "@/types";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.category}</p>
      <button onClick={() => onEdit(product)}>Modifier</button>
      <button onClick={() => onDelete(product.id)}>Supprimer</button>
    </div>
  );
}

// Avec useState
function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    // ... composant
  );
}
```

---

## 🔹 Exemple Complet: Page Produits avec Toutes les Fonctionnalités

```tsx
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { SearchBar } from "@/components/shared/SearchBar";
import { TablePagination } from "@/components/shared/TablePagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useTableFilters } from "@/hooks/use-table-filters";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import type { Product } from "@/types";

export default function Products() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    paginatedData,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    setCurrentPage,
    setPageSize,
  } = useTableFilters({
    data: products,
    searchFields: ["name", "category", "supplier"],
    initialPageSize: 10,
  });

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Appel API
      if (selectedProduct) {
        showSuccessToast("Produit modifié avec succès");
      } else {
        showSuccessToast("Produit ajouté avec succès");
      }
    } catch (error) {
      showErrorToast("Erreur lors de l'enregistrement");
    }
  };

  const confirmDelete = async () => {
    try {
      // TODO: Appel API
      showSuccessToast("Produit supprimé");
    } catch (error) {
      showErrorToast("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Produits">
        <TableSkeleton rows={10} columns={6} />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Produits" subtitle="Gérez votre catalogue">
      {/* Barre d'actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un produit..."
          className="flex-1 max-w-md"
        />
        <Button onClick={handleCreate} className="btn-accent gap-2">
          <Plus className="w-4 h-4" />
          Nouveau produit
        </Button>
      </div>

      {/* Liste des produits */}
      {paginatedData.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun produit trouvé"
          description="Commencez par ajouter votre premier produit"
          actionLabel="Ajouter un produit"
          onAction={handleCreate}
        />
      ) : (
        <>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left">Produit</th>
                  <th className="px-4 py-3 text-left">Catégorie</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-right">Prix</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3 text-center">{product.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {formatPrice(product.sellPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </>
      )}

      {/* Modals */}
      <ProductFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={selectedProduct}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={selectedProduct?.name}
      />
    </MainLayout>
  );
}
```

---

## 🎯 Bonnes Pratiques

1. **Toujours typer avec TypeScript** - Utilisez les types de `@/types`
2. **Gérer les états de chargement** - Utilisez LoadingSpinner ou Skeleton
3. **Afficher des messages** - Utilisez les toast pour le feedback
4. **Valider les formulaires** - Zod est déjà configuré
5. **Responsive** - Testez sur mobile, tablet et desktop
6. **Accessibilité** - Les composants shadcn/ui sont accessibles par défaut

---

Voilà ! Vous avez maintenant tous les exemples pour utiliser les composants créés. 🚀
