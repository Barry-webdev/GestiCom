import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface Props {
  data?: any[];
  loading?: boolean;
}

export function RecentSales({ data = [], loading }: Props) {
  const navigate = useNavigate();
  const formatPrice = (v: number) => new Intl.NumberFormat("fr-GN").format(v) + " GNF";
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Ventes récentes</h3>
          <p className="text-sm text-muted-foreground">Les 5 dernières</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors" onClick={() => navigate("/sales")}>
          Voir tout <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div></div>
              <div className="space-y-1 text-right"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-12" /></div>
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="text-center py-8"><p className="text-sm text-muted-foreground">Aucune vente récente</p></div>
        ) : (
          data.map((sale: any) => (
            <div key={sale._id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{(sale.client?.name || sale.clientName)?.charAt(0) || "?"}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{sale.client?.name || sale.clientName}</p>
                  <p className="text-xs text-muted-foreground">{sale.items?.length || 0} article{sale.items?.length > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{formatPrice(sale.total)}</p>
                <p className="text-xs text-muted-foreground">{formatTime(sale.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
