import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  Edit,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Données mockées
const productData = {
  id: 1,
  name: "Riz importé 50kg",
  category: "Alimentaire",
  quantity: 45,
  unit: "sac",
  buyPrice: 380000,
  sellPrice: 450000,
  threshold: 20,
  supplier: "Fria Commerce",
  status: "ok",
  description: "Riz de qualité supérieure importé d'Asie, conditionné en sacs de 50kg.",
};

const stockHistory = [
  { date: "01/12", quantity: 30 },
  { date: "05/12", quantity: 50 },
  { date: "10/12", quantity: 42 },
  { date: "15/12", quantity: 38 },
  { date: "20/12", quantity: 45 },
];

const recentMovements = [
  {
    id: 1,
    date: "22/12/2024",
    type: "entry",
    quantity: 10,
    reason: "Achat",
    user: "Admin Principal",
  },
  {
    id: 2,
    date: "20/12/2024",
    type: "exit",
    quantity: 5,
    reason: "Vente",
    user: "Vendeur 1",
  },
  {
    id: 3,
    date: "18/12/2024",
    type: "exit",
    quantity: 8,
    reason: "Vente",
    user: "Vendeur 2",
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
  };

  const profit = productData.sellPrice - productData.buyPrice;
  const profitMargin = ((profit / productData.buyPrice) * 100).toFixed(1);

  return (
    <MainLayout title="Détail du produit" subtitle="Informations complètes">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate("/products")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Button className="btn-accent gap-2">
          <Edit className="w-4 h-4" />
          Modifier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card principale */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {productData.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {productData.category}
                  </Badge>
                  <span className="badge-success">En stock</span>
                </div>
              </div>
            </div>

            {productData.description && (
              <p className="text-muted-foreground mb-6">{productData.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Quantité</p>
                <p className="text-2xl font-bold text-foreground">
                  {productData.quantity}
                </p>
                <p className="text-xs text-muted-foreground">{productData.unit}s</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Prix achat</p>
                <p className="text-lg font-bold text-foreground">
                  {formatPrice(productData.buyPrice)}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Prix vente</p>
                <p className="text-lg font-bold text-secondary">
                  {formatPrice(productData.sellPrice)}
                </p>
              </div>
              <div className="bg-success/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Marge</p>
                <p className="text-lg font-bold text-success">{profitMargin}%</p>
                <p className="text-xs text-muted-foreground">{formatPrice(profit)}</p>
              </div>
            </div>
          </div>

          {/* Évolution du stock */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Évolution du stock
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                  <XAxis
                    dataKey="date"
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 100%)",
                      border: "1px solid hsl(220 13% 88%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="quantity"
                    stroke="hsl(38 92% 50%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(38 92% 50%)", strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mouvements récents */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Mouvements récents
            </h3>
            <div className="space-y-3">
              {recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {movement.type === "entry" ? (
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-success" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-destructive" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {movement.type === "entry" ? "Entrée" : "Sortie"} -{" "}
                        {movement.reason}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {movement.date} • {movement.user}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      movement.type === "entry" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {movement.type === "entry" ? "+" : "-"}
                    {movement.quantity} {productData.unit}s
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations supplémentaires */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Informations</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Seuil d'alerte</p>
                  <p className="text-sm text-muted-foreground">
                    {productData.threshold} {productData.unit}s
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Unité</p>
                  <p className="text-sm text-muted-foreground">{productData.unit}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Fournisseur</p>
                  <p className="text-sm text-muted-foreground">{productData.supplier}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Ventes ce mois</span>
                  <span className="font-semibold text-foreground">24</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-3/4"></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Rotation stock</span>
                  <span className="font-semibold text-success">Élevée</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success w-5/6"></div>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Valeur totale en stock</p>
                <p className="text-xl font-bold text-foreground">
                  {formatPrice(productData.quantity * productData.sellPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
