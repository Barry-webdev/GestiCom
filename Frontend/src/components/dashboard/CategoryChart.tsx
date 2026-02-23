import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { productService } from "@/services/product.service";

const COLORS = [
  'hsl(38 92% 50%)',   // Gold
  'hsl(222 47% 20%)',  // Navy
  'hsl(142 76% 36%)',  // Green
  'hsl(221 83% 53%)',  // Blue
  'hsl(280 100% 70%)', // Purple
  'hsl(0 84% 60%)',    // Red
];

export function CategoryChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryData();
  }, []);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      
      if (response.success && response.data.length > 0) {
        // Grouper par catégorie
        const categoryMap = new Map<string, number>();
        let total = 0;
        
        response.data.forEach((product: any) => {
          const quantity = product.quantity || 0;
          const current = categoryMap.get(product.category) || 0;
          categoryMap.set(product.category, current + quantity);
          total += quantity;
        });
        
        // Convertir en pourcentages
        const chartData = Array.from(categoryMap.entries()).map(([name, value], index) => ({
          name,
          value: total > 0 ? Math.round((value / total) * 100) : 0,
          color: COLORS[index % COLORS.length],
        }));
        
        setData(chartData);
      }
    } catch (error) {
      console.error("Erreur chargement graphique catégories:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-300">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Répartition par catégorie</h3>
        <p className="text-sm text-muted-foreground">Stock actuel</p>
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
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(220 13% 88%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px hsl(222 47% 11% / 0.08)",
              }}
              formatter={(value: number) => `${value}%`}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
