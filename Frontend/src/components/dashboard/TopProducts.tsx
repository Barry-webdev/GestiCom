import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";

export function TopProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats().then(res => {
      if (res.success && res.data?.topProducts) {
        setProducts(res.data.topProducts.filter((p: any) => p.product));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("fr-GN").format(v) + " GNF";

  const maxQty = products.length > 0 ? Math.max(...products.map(p => p.quantity)) : 1;

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top produits</h3>
          <p className="text-sm text-muted-foreground">Les plus vendus</p>
        </div>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Aucune vente enregistrée</p>
          </div>
        ) : (
          products.map((item) => (
            <div key={item.product._id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item.product.name}</span>
                <span className="text-sm text-muted-foreground">{item.quantity} vendus</span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-secondary to-amber-400"
                  style={{ width: `${(item.quantity / maxQty) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                CA: {formatPrice(item.revenue)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
