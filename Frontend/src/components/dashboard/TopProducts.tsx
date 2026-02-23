import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { productService } from "@/services/product.service";

export function TopProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopProducts();
  }, []);

  const loadTopProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      
      if (response.success) {
        // Trier par quantité vendue (on peut améliorer avec des stats réelles)
        const sorted = response.data
          .sort((a: any, b: any) => b.quantity - a.quantity)
          .slice(0, 5);
        setProducts(sorted);
      }
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
  };

  const maxQuantity = products.length > 0 ? Math.max(...products.map((p) => p.quantity)) : 1;

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top produits</h3>
          <p className="text-sm text-muted-foreground">En stock</p>
        </div>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Aucun produit</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product._id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{product.name}</span>
                <span className="text-sm text-muted-foreground">{product.quantity} {product.unit}s</span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-secondary to-amber-400"
                  style={{ width: `${(product.quantity / maxQuantity) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valeur: {formatPrice(product.quantity * product.sellPrice)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
