import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Filter, Edit, Trash2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { productService } from "@/services/product.service";
import { usePermissions } from "@/hooks/use-permissions";
import type { Product } from "@/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ok":
      return <span className="badge-success">En stock</span>;
    case "low":
      return <span className="badge-warning">Stock bas</span>;
    case "out":
      return <span className="badge-destructive">Rupture</span>;
    default:
      return null;
  }
}

export default function Products() {
  const permissions = usePermissions();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Charger les produits depuis l'API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      showErrorToast("Erreur", "Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les produits
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedProduct) {
        // Modification
        const response = await productService.update(selectedProduct._id || selectedProduct.id.toString(), data);
        if (response.success) {
          showSuccessToast("Produit modifié", "Les modifications ont été enregistrées");
          loadProducts();
        }
      } else {
        // Création
        const response = await productService.create(data);
        if (response.success) {
          showSuccessToast("Produit ajouté", "Le produit a été ajouté au catalogue");
          loadProducts();
        }
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Une erreur est survenue");
    }
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await productService.delete(selectedProduct._id || selectedProduct.id.toString());
      if (response.success) {
        showSuccessToast("Produit supprimé", `${selectedProduct.name} a été supprimé`);
        setDeleteDialogOpen(false);
        loadProducts();
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Impossible de supprimer le produit");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Produits" subtitle="Gérez votre catalogue de produits et vos stocks">
        <LoadingSpinner size="lg" text="Chargement des produits..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Produits"
      subtitle="Gérez votre catalogue de produits et vos stocks"
    >
      {/* Actions Bar */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 animate-slide-up opacity-0">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un produit..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
            <Button className="btn-accent gap-2" onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              Nouveau produit
            </Button>
          )}
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun produit"
          description="Commencez par ajouter votre premier produit au catalogue"
          actionLabel="Ajouter un produit"
          onAction={handleCreate}
        />
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
                      <p className="text-xs text-muted-foreground">
                        Seuil: {product.threshold} {product.unit}s
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{product.category}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      "font-semibold",
                      product.status === "out" && "text-destructive",
                      product.status === "low" && "text-warning",
                      product.status === "ok" && "text-foreground"
                    )}
                  >
                    {product.quantity} {product.unit}s
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatPrice(product.buyPrice)}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {formatPrice(product.sellPrice)}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {product.supplier?.name || product.supplier}
                  </span>
                </TableCell>
                <TableCell className="text-center">{getStatusBadge(product.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {permissions.canEditProduct && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                    {permissions.canDeleteProduct && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteClick(product)}
                      >
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
