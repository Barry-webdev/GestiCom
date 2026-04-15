import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { dashboardService } from "@/services/dashboard.service";

const COLORS = [
  'hsl(38 92% 50%)',
  'hsl(222 47% 20%)',
  'hsl(142 76% 36%)',
  'hsl(221 83% 53%)',
  'hsl(280 100% 70%)',
  'hsl(0 84% 60%)',
];

export function CategoryChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats().then(res => {
      if (res.success && res.data?.charts?.categorySales) {
        const cats = res.data.charts.categorySales.filter((c: any) => c.value > 0);
        const total = cats.reduce((s: number, c: any) => s + c.value, 0);
        setData(cats.map((c: any, i: number) => ({
          name: c.name,
          value: total > 0 ? Math.round((c.value / total) * 100) : 0,
          color: COLORS[i % COLORS.length],
        })));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-300">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Répartition par catégorie</h3>
        <p className="text-sm text-muted-foreground">Ventes par famille</p>
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
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(220 13% 88%)", borderRadius: "8px" }}
                formatter={(v: number) => `${v}%`}
              />
              <Legend verticalAlign="bottom" height={36}
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
