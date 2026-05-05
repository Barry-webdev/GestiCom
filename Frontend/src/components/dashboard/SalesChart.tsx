import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  data?: any[];
  loading?: boolean;
}

export function SalesChart({ data = [], loading }: Props) {
  const chartData = data.map((d: any) => ({ name: d.name, ventes: d.revenue }));

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Aperçu des ventes</h3>
          <p className="text-sm text-muted-foreground">Cette semaine</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-muted-foreground">Ventes</span>
        </div>
      </div>
      <div className="h-[300px]">
        {loading ? (
          <div className="space-y-3 pt-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" style={{ opacity: 1 - i * 0.15 }} />)}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis dataKey="name" stroke="hsl(220 9% 46%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(220 9% 46%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(220 13% 88%)", borderRadius: "8px" }}
                formatter={(v: number) => new Intl.NumberFormat("fr-GN").format(v) + " GNF"}
              />
              <Area type="monotone" dataKey="ventes" stroke="hsl(38 92% 50%)" strokeWidth={2} fillOpacity={1} fill="url(#colorVentes)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
