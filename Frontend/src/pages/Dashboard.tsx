import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Banknote,
  ShoppingCart,
  Users,
} from "lucide-react";
import { productService } from "@/services/product.service";
import { saleService } from "@/services/sale.service";
import { clientService } from "@/services/client.service";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalProducts: 0,
    stockValue: 0,
    todaySales: 0,
    monthRevenue: 0,
    activeClients: 0,
    lowStockAlerts: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les données en parallèle avec Promise.all pour plus de rapidité
      const [productsRes, salesStatsRes, clientsRes, lowStockRes] = await Promise.all([
        productService.getAll({ limit: 1000 }), // Limiter à 1000 produits
        saleService.getStats(),
        clientService.getAll({ limit: 1000 }), // Limiter à 1000 clients
        productService.getLowStock(),
      ]);

      // Calculer la valeur du stock
      let stockValue = 0;
      if (productsRes.success) {
        stockValue = productsRes.data.reduce((sum: number, p: any) => 
          sum + (p.quantity * p.buyPrice), 0
        );
      }

      setStats({
        totalProducts: productsRes.success ? productsRes.count : 0,
        stockValue,
        todaySales: salesStatsRes.success ? salesStatsRes.data.todayCount : 0,
        monthRevenue: salesStatsRes.success ? salesStatsRes.data.monthTotal : 0,
        activeClients: clientsRes.success ? clientsRes.data.filter((c: any) => c.status === 'active').length : 0,
        lowStockAlerts: lowStockRes.success ? lowStockRes.count : 0,
      });
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Tableau de bord" subtitle="Bienvenue sur GestiStock - Vue d'ensemble de votre activité">
        <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
      </MainLayout>
    );
  }
  return (
    <MainLayout
      title="Tableau de bord"
      subtitle="Bienvenue sur GestiStock - Vue d'ensemble de votre activité"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Stock total"
          value={stats.totalProducts.toString()}
          change={stats.totalProducts > 0 ? "Produits en stock" : "Aucun produit"}
          changeType="neutral"
          icon={Package}
          iconColor="text-primary"
          delay={0}
        />
        <StatCard
          title="Valeur stock"
          value={`${(stats.stockValue / 1000000).toFixed(1)}M`}
          change="GNF"
          changeType="neutral"
          icon={Banknote}
          iconColor="text-success"
          delay={100}
        />
        <StatCard
          title="Ventes du jour"
          value={stats.todaySales.toString()}
          change={stats.todaySales > 0 ? "Ventes aujourd'hui" : "Aucune vente"}
          changeType={stats.todaySales > 0 ? "positive" : "neutral"}
          icon={ShoppingCart}
          iconColor="text-secondary"
          delay={200}
        />
        <StatCard
          title="CA mensuel"
          value={`${(stats.monthRevenue / 1000000).toFixed(1)}M`}
          change="GNF"
          changeType={stats.monthRevenue > 0 ? "positive" : "neutral"}
          icon={TrendingUp}
          iconColor="text-info"
          delay={300}
        />
        <StatCard
          title="Clients actifs"
          value={stats.activeClients.toString()}
          change={stats.activeClients > 0 ? "Clients" : "Aucun client"}
          changeType="neutral"
          icon={Users}
          iconColor="text-primary"
          delay={400}
        />
        <StatCard
          title="Alertes stock"
          value={stats.lowStockAlerts.toString()}
          change={stats.lowStockAlerts > 0 ? "Produits en alerte" : "Aucune alerte"}
          changeType={stats.lowStockAlerts > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          iconColor="text-destructive"
          delay={500}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <CategoryChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentSales />
        <TopProducts />
        <AlertsCard />
      </div>
    </MainLayout>
  );
}
