import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, Edit, Trash2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { productService } from "@/services/product.service";
import { usePermissions } from "@/hooks/use-permissions";
import { useCachedData } from "@/hooks/use-cached-data";
import type { Product } from "@/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ok": return <span className="badge-success">En stock</span>;
    case "low": return <span className="badge-warning">Stock bas</span>;
    case "out": return <span className="badge-destructive">Rupture</span>;
    default: return null;
  }
}

export default function Products() {
  const permissions = usePermissions();
  const qc = useQueryClient();

  const { data, loading, refresh } = useCachedData<Product[]>(
    'products',
    async () => {
      const res = await productService.getAll();
      return res.success ? res.data : [];
    },
    { staleTime: 60_000 }
  );

  const products = data ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  const handleSubmit = async (formData: any) => {
    if (selectedProduct) {
      // --- OPTIMISTIC UPDATE ---
      const id = selectedProduct._id || selectedProduct.id?.toString();
      const prev = qc.getQueryData<Product[]>(['products']);
      qc.setQueryData<Product[]>(['products'], old =>
        (old ?? []).map(p => (p._id === id || p.id?.toString() === id) ? { ...p, ...formData } : p)
      );
      try {
        await productService.update(id, formData);
        showSuccessToast("Produit modifié", "Modifications enregistrées");
        refresh();
      } catch (e: any) {
        qc.setQueryData(['products'], prev); // rollback
        showErrorToast("Erreur", e.response?.data?.message || "Impossible de modifier");
      }
    } else {
      // --- OPTIMISTIC CREATE ---
      const tempId = `temp_${Date.now()}`;
      const optimisticProduct = { ...formData, _id: tempId, status: 'ok', createdAt: new Date().toISOString() };
      const prev = qc.getQueryData<Product[]>(['products']);
      qc.setQueryData<Product[]>(['products'], old => [optimisticProduct as any, ...(old ?? [])]);
      try {
        await productService.create(formData);
        showSuccessToast("Produit ajouté", "Produit ajouté au catalogue");
        refresh(); // Remplace le temp par le vrai
      } catch (e: any) {
        qc.setQueryData(['products'], prev); // rollback
        showErrorToast("Erreur", e.response?.data?.message || "Impossible d'ajouter");
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    const id = selectedProduct._id || selectedProduct.id?.toString();
    // --- OPTIMISTIC DELETE ---
    const prev = qc.getQueryData<Product[]>(['products']);
    qc.setQueryData<Product[]>(['products'], old => (old ?? []).filter(p => p._id !== id && p.id?.toString() !== id));
    setDeleteDialogOpen(false);
    try {
      await productService.delete(id);
      showSuccessToast("Supprimé", `${selectedProduct.name} supprimé`);
    } catch (e: any) {
      qc.setQueryData(['products'], prev); // rollback
      showErrorToast("Erreur", e.response?.data?.message || "Impossible de supprimer");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Produits" subtitle="Gérez votre catalogue de produits et vos stocks">
        <TableSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Produits" subtitle="Gérez votre catalogue de produits et vos stocks">
      <div className="bg-card rounded-xl border border-border p-4 mb-6 animate-slide-up opacity-0">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher un produit..." className="pl-10"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="alimentaire">Alimentaire</SelectItem>
                <SelectItem value="quincaillerie">Quincaillerie</SelectItem>
                <SelectItem value="vetements">Vêtements</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {permissions.canCreateProduct && (
            <Button className="btn-accent gap-2" onClick={() => { setSelectedProduct(null); setModalOpen(true); }}>
              <Plus className="w-4 h-4" />Nouveau produit
            </Button>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState icon={Package} title="Aucun produit"
          description="Commencez par ajouter votre premier produit au catalogue"
          actionLabel="Ajouter un produit" onAction={() => { setSelectedProduct(null); setModalOpen(true); }} />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up opacity-0 delay-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Produit</TableHead>
                <TableHead className="font-semibold">Catégorie</TableHead>
                <TableHead className="font-semibold text-center">Quantité</TableHead>
                <TableHead className="font-semibold text-right">Prix d'achat</TableHead>
                <TableHead className="font-semibold text-right">Prix de vente</TableHead>
                <TableHead className="font-semibold">Fournisseur</TableHead>
                <TableHead className="font-semibold text-center">Statut</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product: any) => (
                <TableRow key={product._id || product.id} className="table-row">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">Seuil: {product.threshold} {product.unit}s</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{product.category}</span></TableCell>
                  <TableCell className="text-center">
                    <span className={cn("font-semibold",
                      product.status === "out" && "text-destructive",
                      product.status === "low" && "text-warning",
                      product.status === "ok" && "text-foreground"
                    )}>
                      {product.quantity} {product.unit}s
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">{formatPrice(product.buyPrice)}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatPrice(product.sellPrice)}</TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{product.supplier?.name || product.supplier}</span></TableCell>
                  <TableCell className="text-center">{getStatusBadge(product.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {permissions.canEditProduct && (
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { setSelectedProduct(product); setModalOpen(true); }}>
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                      {permissions.canDeleteProduct && (
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { setSelectedProduct(product); setDeleteDialogOpen(true); }}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductFormModal open={modalOpen} onOpenChange={setModalOpen}
        product={selectedProduct} onSubmit={handleSubmit} />
      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete} itemName={selectedProduct?.name} />
    </MainLayout>
  );
}
