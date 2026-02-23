import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { saleService } from "@/services/sale.service";

export function SalesChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const response = await saleService.getAll();
      
      if (response.success && response.data.length > 0) {
        // Grouper les ventes par jour (7 derniers jours)
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
          
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          
          const daySales = response.data.filter((sale: any) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= dayStart && saleDate <= dayEnd;
          });
          
          const totalVentes = daySales.reduce((sum: number, sale: any) => sum + sale.total, 0);
          
          last7Days.push({
            name: dayName,
            ventes: totalVentes,
            achats: 0, // Pas de données d'achats pour l'instant
          });
        }
        
        setData(last7Days);
      }
    } catch (error) {
      console.error("Erreur chargement graphique ventes:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Aperçu des ventes</h3>
          <p className="text-sm text-muted-foreground">Cette semaine</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Ventes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Achats</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAchats" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(222 47% 20%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(222 47% 20%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
            <XAxis
              dataKey="name"
              stroke="hsl(220 9% 46%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(220 9% 46%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(220 13% 88%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px hsl(222 47% 11% / 0.08)",
              }}
              formatter={(value: number) =>
                new Intl.NumberFormat("fr-GN").format(value) + " GNF"
              }
            />
            <Area
              type="monotone"
              dataKey="ventes"
              stroke="hsl(38 92% 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVentes)"
            />
            <Area
              type="monotone"
              dataKey="achats"
              stroke="hsl(222 47% 20%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAchats)"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
