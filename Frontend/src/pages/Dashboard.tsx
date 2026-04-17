import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { TopProducts } from "@/components/dashboard/TopProducts";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Banknote,
  ShoppingCart,
  Users,
} from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import { useCachedData } from "@/hooks/use-cached-data";

const defaultStats = {
  totalProducts: 0,
  stockValue: 0,
  todaySales: 0,
  monthRevenue: 0,
  activeClients: 0,
  lowStockAlerts: 0,
};

function formatMontant(value: number): string {
  if (value === 0) return "0 GNF";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".", ",")} M GNF`;
  return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
}

async function fetchDashboardStats() {
  const res = await dashboardService.getStats();
  if (!res.success) return defaultStats;
  const o = res.data.overview;
  return {
    totalProducts: o.totalProducts ?? 0,
    stockValue: o.stockValue ?? 0,
    todaySales: o.todaySalesCount ?? 0,
    monthRevenue: o.monthRevenue ?? 0,
    activeClients: o.activeClients ?? 0,
    lowStockAlerts: o.lowStockAlerts ?? 0,
  };
}

export default function Dashboard() {
  const { data: stats } = useCachedData('dashboard-stats', fetchDashboardStats, { staleTime: 60_000 });
  const s = stats ?? defaultStats;

  return (
    <MainLayout
      title="Tableau de bord"
      subtitle="Bienvenue sur GestiStock - Vue d'ensemble de votre activité"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Stock total"
          value={s.totalProducts.toString()}
          change={s.totalProducts > 0 ? "Produits en stock" : "Aucun produit"}
          changeType="neutral"
          icon={Package}
          iconColor="text-primary"
          delay={0}
        />
        <StatCard
          title="Valeur stock"
          value={formatMontant(s.stockValue)}
          change="Valeur totale"
          changeType="neutral"
          icon={Banknote}
          iconColor="text-success"
          delay={100}
        />
        <StatCard
          title="Ventes du jour"
          value={s.todaySales.toString()}
          change={s.todaySales > 0 ? "Ventes aujourd'hui" : "Aucune vente"}
          changeType={s.todaySales > 0 ? "positive" : "neutral"}
          icon={ShoppingCart}
          iconColor="text-secondary"
          delay={200}
        />
        <StatCard
          title="CA mensuel"
          value={formatMontant(s.monthRevenue)}
          change="Ce mois"
          changeType={s.monthRevenue > 0 ? "positive" : "neutral"}
          icon={TrendingUp}
          iconColor="text-info"
          delay={300}
        />
        <StatCard
          title="Clients actifs"
          value={s.activeClients.toString()}
          change={s.activeClients > 0 ? "Clients" : "Aucun client"}
          changeType="neutral"
          icon={Users}
          iconColor="text-primary"
          delay={400}
        />
        <StatCard
          title="Alertes stock"
          value={s.lowStockAlerts.toString()}
          change={s.lowStockAlerts > 0 ? "Produits en alerte" : "Aucune alerte"}
          changeType={s.lowStockAlerts > 0 ? "negative" : "positive"}
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
