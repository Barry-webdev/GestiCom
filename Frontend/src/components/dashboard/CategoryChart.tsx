import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['hsl(38 92% 50%)', 'hsl(222 47% 20%)', 'hsl(142 76% 36%)', 'hsl(221 83% 53%)', 'hsl(280 100% 70%)', 'hsl(0 84% 60%)'];

interface Props {
  data?: any[];
  loading?: boolean;
}

export function CategoryChart({ data = [], loading }: Props) {
  const chartData = data
    .filter((c: any) => c.value > 0)
    .map((c: any, i: number) => ({ name: c.name, value: c.value, color: COLORS[i % COLORS.length] }));

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Répartition par catégorie</h3>
        <p className="text-sm text-muted-foreground">Ventes par famille</p>
      </div>
      <div className="h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="w-40 h-40 rounded-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(220 13% 88%)", borderRadius: "8px" }}
                formatter={(v: number) => new Intl.NumberFormat("fr-GN").format(v) + " GNF"}
              />
              <Legend verticalAlign="bottom" height={36} formatter={value => <span className="text-sm text-muted-foreground">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
