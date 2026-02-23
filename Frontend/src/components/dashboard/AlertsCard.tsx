import { useState, useEffect } from "react";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { productService } from "@/services/product.service";

export function AlertsCard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await productService.getLowStock();
      
      if (response.success) {
        const alertsList = response.data.map((product: any) => ({
          id: product._id,
          message: `${product.name} - Stock: ${product.quantity} ${product.unit}s`,
          severity: product.status === 'out' ? 'high' : 'medium',
          icon: product.status === 'out' ? Package : TrendingDown,
        }));
        setAlerts(alertsList);
      }
    } catch (error) {
      console.error("Erreur chargement alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Alertes stock</h3>
          <p className="text-sm text-muted-foreground">
            {loading ? "Chargement..." : `${alerts.length} alerte${alerts.length > 1 ? 's' : ''} active${alerts.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Aucune alerte</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.severity === "high"
                  ? "bg-destructive/5 border border-destructive/20"
                  : "bg-warning/5 border border-warning/20"
              }`}
            >
              <alert.icon
                className={`w-4 h-4 ${
                  alert.severity === "high" ? "text-destructive" : "text-warning"
                }`}
              />
              <p className="text-sm text-foreground">{alert.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
