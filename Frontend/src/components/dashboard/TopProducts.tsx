import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  data?: any[];
  loading?: boolean;
}

export function TopProducts({ data = [], loading }: Props) {
  const formatPrice = (v: number) => new Intl.NumberFormat("fr-GN").format(v) + " GNF";
  const maxQty = data.length > 0 ? Math.max(...data.map(p => p.quantity)) : 1;

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
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
          [...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-16" /></div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="text-center py-8"><p className="text-sm text-muted-foreground">Aucune vente enregistrée</p></div>
        ) : (
          data.filter((item: any) => item.product).map((item: any) => (
            <div key={item.product._id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item.product.name}</span>
                <span className="text-sm text-muted-foreground">{item.quantity} vendus</span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-secondary to-amber-400" style={{ width: `${(item.quantity / maxQty) * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">CA: {formatPrice(item.revenue)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
