import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  Edit,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { productService } from "@/services/product.service";
import { stockService } from "@/services/stock.service";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (productId: string) => {
    try {
      setLoading(true);
      const [productRes, stockRes] = await Promise.all([
        productService.getById(productId),
        stockService.getAll({ search: "" }),
      ]);
      if (productRes.success) setProduct(productRes.data);
      if (stockRes.success) {
        // Filtrer les mouvements liés à ce produit
        const filtered = stockRes.data.filter(
          (m: any) => m.product === productId || m.product?._id === productId
        );
        setMovements(filtered.slice(0, 10));
      }
    } catch (error) {
      console.error("Erreur chargement produit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data: any) => {
    try {
      const response = await productService.update(id!, data);
      if (response.success) {
        showSuccessToast("Produit modifié", "Les modifications ont été enregistrées");
        setEditModalOpen(false);
        loadData(id!);
      }
    } catch (error: any) {
      showErrorToast("Erreur", error.response?.data?.message || "Impossible de modifier le produit");
    }
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("fr-GN").format(value) + " GNF";

  if (loading) {
    return (
      <MainLayout title="Détail du produit" subtitle="Informations complètes">
        <LoadingSpinner size="lg" text="Chargement du produit..." />
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout title="Détail du produit" subtitle="Informations complètes">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Produit introuvable.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/products")}>
            Retour aux produits
          </Button>
        </div>
      </MainLayout>
    );
  }

  const profit = product.sellPrice - product.buyPrice;
  const profitMargin = product.buyPrice > 0
    ? ((profit / product.buyPrice) * 100).toFixed(1)
    : "0";

  const stockStatus =
    product.quantity === 0
      ? { label: "Rupture", cls: "badge-destructive" }
      : product.quantity <= product.threshold
      ? { label: "Stock bas", cls: "badge-warning" }
      : { label: "En stock", cls: "badge-success" };

  // Construire l'historique de stock à partir des mouvements
  const stockHistory = movements.slice().reverse().map((m: any, i: number) => ({
    date: new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    quantity: m.quantityAfter ?? product.quantity,
  }));

  return (
    <MainLayout title="Détail du produit" subtitle="Informations complètes">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate("/products")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Button className="btn-accent gap-2" onClick={() => setEditModalOpen(true)}>
          <Edit className="w-4 h-4" />
          Modifier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">{product.name}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {product.category}
                  </Badge>
                  <span className={stockStatus.cls}>{stockStatus.label}</span>
                </div>
              </div>
            </div>

            {product.description && (
              <p className="text-muted-foreground mb-6">{product.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Quantité</p>
                <p className="text-2xl font-bold text-foreground">{product.quantity}</p>
                <p className="text-xs text-muted-foreground">{product.unit}s</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Prix achat</p>
                <p className="text-lg font-bold text-foreground">{formatPrice(product.buyPrice)}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Prix vente</p>
                <p className="text-lg font-bold text-secondary">{formatPrice(product.sellPrice)}</p>
              </div>
              <div className="bg-success/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Marge</p>
                <p className="text-lg font-bold text-success">{profitMargin}%</p>
                <p className="text-xs text-muted-foreground">{formatPrice(profit)}</p>
              </div>
            </div>
          </div>

          {/* Évolution du stock */}
          {stockHistory.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Évolution du stock</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                    <XAxis dataKey="date" stroke="hsl(220 9% 46%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(220 9% 46%)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(220 13% 88%)", borderRadius: "8px" }}
                    />
                    <Line type="monotone" dataKey="quantity" stroke="hsl(38 92% 50%)" strokeWidth={3} dot={{ fill: "hsl(38 92% 50%)", strokeWidth: 2, r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Mouvements récents */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Mouvements récents</h3>
            {movements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun mouvement enregistré</p>
            ) : (
              <div className="space-y-3">
                {movements.map((movement: any) => (
                  <div key={movement._id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {movement.type === "entry" ? (
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-success" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <TrendingDown className="w-5 h-5 text-destructive" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {movement.type === "entry" ? "Entrée" : "Sortie"} — {movement.reason}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(movement.createdAt).toLocaleDateString("fr-FR")} • {movement.userName || "—"}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${movement.type === "entry" ? "text-success" : "text-destructive"}`}>
                      {movement.type === "entry" ? "+" : "-"}{movement.quantity} {product.unit}s
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Informations</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Seuil d'alerte</p>
                  <p className="text-sm text-muted-foreground">{product.threshold} {product.unit}s</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Unité</p>
                  <p className="text-sm text-muted-foreground">{product.unit}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Fournisseur</p>
                  <p className="text-sm text-muted-foreground">
                    {product.supplier?.name || product.supplier || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Mouvements récents</span>
                  <span className="font-semibold text-foreground">{movements.length}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${Math.min(movements.length * 10, 100)}%` }} />
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Valeur totale en stock</p>
                <p className="text-xl font-bold text-foreground">
                  {formatPrice(product.quantity * product.sellPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        product={product}
        onSubmit={handleEdit}
      />
    </MainLayout>
  );
}
