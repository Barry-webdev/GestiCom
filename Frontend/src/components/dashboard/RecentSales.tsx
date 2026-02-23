import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { saleService } from "@/services/sale.service";

export function RecentSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentSales();
  }, []);

  const loadRecentSales = async () => {
    try {
      setLoading(true);
      
      const response = await saleService.getAll();
      console.log('RecentSales - Response:', response);
      
      if (response.success) {
        console.log('RecentSales - Data:', response.data);
        console.log('RecentSales - Count:', response.data.length);
        // Prendre les 5 dernières ventes (les plus récentes)
        setSales(response.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Erreur chargement ventes:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-400">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Ventes récentes</h3>
          <p className="text-sm text-muted-foreground">Les 5 dernières</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors">
          Voir tout
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Aucune vente récente</p>
            <p className="text-xs text-muted-foreground mt-2">Debug: {JSON.stringify(sales)}</p>
          </div>
        ) : (
          sales.map((sale) => {
            console.log('Rendering sale:', sale);
            return (
              <div
                key={sale._id}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {sale.clientName?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{sale.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.items?.length || 0} article{sale.items?.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatPrice(sale.total)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(sale.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
