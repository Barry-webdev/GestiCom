import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Calendar, Eye, FileText, Receipt, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SaleFormModal } from "@/components/sales/SaleFormModal";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { saleService } from "@/services/sale.service";
import { usePermissions } from "@/hooks/use-permissions";
import { useNavigate } from "react-router-dom";

const sales: any[] = [];

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <span className="badge-success">Complétée</span>;
    case "pending":
      return <span className="badge-warning">En attente</span>;
    case "cancelled":
      return <span className="badge-destructive">Annulée</span>;
    default:
      return null;
  }
}

function getPaymentStatusBadge(paymentStatus: string) {
  switch (paymentStatus) {
    case "paid":
      return <span className="badge-success">Payé</span>;
    case "partial":
      return <span className="badge-warning">Partiellement payé</span>;
    case "unpaid":
      return <span className="badge-destructive">Impayé</span>;
    default:
      return <span className="badge-muted">N/A</span>;
  }
}

export default function Sales() {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [salesData, setSalesData] = useState(sales);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les ventes et stats depuis l'API
  useEffect(() => {
    loadSales();
    loadStats();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await saleService.getAll();
      if (response.success) {
        setSalesData(response.data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      showErrorToast("Erreur", "Impossible de charger les ventes");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await saleService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error("Erreur stats:", error);
    }
  };

  const filteredSales = salesData.filter((sale) =>
    sale.saleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSale = async (data: any) => {
    try {
      const response = await saleService.create(data);
      if (response.success) {
        showSuccessToast("Succès", "Vente créée avec succès");
        loadSales();
        loadStats();
      }
    } catch (error: any) {
      showErrorToast("Erreur", error.response?.data?.message || "Impossible de créer la vente");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Ventes" subtitle="Historique et gestion de vos transactions commerciales">
        <LoadingSpinner size="lg" text="Chargement des ventes..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Ventes"
      subtitle="Historique et gestion de vos transactions commerciales"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0">
          <p className="text-sm text-muted-foreground">Ventes aujourd'hui</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats?.todayCount || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.todayCount > 0 ? `${formatPrice(stats.todayTotal)}` : 'Aucune vente'}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-100">
          <p className="text-sm text-muted-foreground">CA aujourd'hui</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats?.todayTotal ? formatPrice(stats.todayTotal) : '0 GNF'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Chiffre d'affaires</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-200">
          <p className="text-sm text-muted-foreground">CA ce mois</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats?.monthTotal ? formatPrice(stats.monthTotal) : '0 GNF'}
          </p>
          <p className="text-xs text-success mt-1">{stats?.monthCount || 0} ventes</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-300">
          <p className="text-sm text-muted-foreground">Panier moyen</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats?.averageBasket ? formatPrice(stats.averageBasket) : '0 GNF'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Par vente</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 animate-slide-up opacity-0 delay-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher une vente..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {permissions.canCreateSale && (
            <Button className="btn-accent gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Nouvelle vente
            </Button>
          )}
        </div>
      </div>

      {/* Sales Table */}
      {filteredSales.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Aucune vente"
          description="Commencez par enregistrer votre première vente"
          actionLabel="Nouvelle vente"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up opacity-0 delay-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">N° Vente</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold text-center">Produits</TableHead>
              <TableHead className="font-semibold text-right">Montant</TableHead>
              <TableHead className="font-semibold">Statut paiement</TableHead>
              <TableHead className="font-semibold text-center">Statut</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow key={sale._id || sale.id} className="table-row">
                <TableCell>
                  <span className="font-mono text-sm font-medium text-primary">{sale.saleId}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(sale.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-foreground">{sale.clientName}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm text-muted-foreground">{sale.items?.length || 0} articles</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-foreground">{formatPrice(sale.total)}</span>
                </TableCell>
                <TableCell>
                  {getPaymentStatusBadge(sale.paymentStatus)}
                </TableCell>
                <TableCell className="text-center">{getStatusBadge(sale.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      title="Voir détails"
                      onClick={() => navigate(`/sales/${sale._id}`)}
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}
      
      {/* Modal de création de vente */}
      <SaleFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateSale}
      />
    </MainLayout>
  );
}
