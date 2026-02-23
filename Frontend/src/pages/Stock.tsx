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
import { Plus, Search, Filter, ArrowUpCircle, ArrowDownCircle, Calendar, Package } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StockMovementModal } from "@/components/stock/StockMovementModal";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { stockService } from "@/services/stock.service";
import { usePermissions } from "@/hooks/use-permissions";

const movements: any[] = [];

export default function Stock() {
  const permissions = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [movementsData, setMovementsData] = useState(movements);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"entry" | "exit">("entry");
  const [stats, setStats] = useState({
    todayEntries: 0,
    todayExits: 0,
    monthEntries: 0,
    monthExits: 0,
  });

  // Charger les mouvements et stats depuis l'API
  useEffect(() => {
    loadMovements();
    loadStats();
  }, []);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const response = await stockService.getAll();
      if (response.success) {
        setMovementsData(response.data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      showErrorToast("Erreur", "Impossible de charger les mouvements de stock");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await stockService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des stats:", error);
    }
  };

  const filteredMovements = movementsData.filter((movement) => {
    const matchesSearch = movement.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movement.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || movement.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateMovement = async (data: any) => {
    try {
      const response = await stockService.create(data);
      if (response.success) {
        showSuccessToast("Succès", "Mouvement de stock enregistré");
        loadMovements();
        loadStats(); // Recharger les stats aussi
      }
    } catch (error: any) {
      showErrorToast("Erreur", error.response?.data?.message || "Impossible de créer le mouvement");
    }
  };

  const openModal = (type: "entry" | "exit") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <MainLayout title="Mouvements de stock" subtitle="Suivez les entrées et sorties de votre inventaire">
        <LoadingSpinner size="lg" text="Chargement des mouvements..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Mouvements de stock"
      subtitle="Suivez les entrées et sorties de votre inventaire"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="w-5 h-5 text-success" />
            <p className="text-sm text-muted-foreground">Entrées aujourd'hui</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.todayEntries}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.todayEntries === 0 ? "Aucune entrée" : stats.todayEntries === 1 ? "Entrée" : "Entrées"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-100">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-muted-foreground">Sorties aujourd'hui</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.todayExits}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.todayExits === 0 ? "Aucune sortie" : stats.todayExits === 1 ? "Sortie" : "Sorties"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-200">
          <p className="text-sm text-muted-foreground">Entrées ce mois</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.monthEntries}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.monthEntries === 0 ? "Aucun mouvement" : stats.monthEntries === 1 ? "Mouvement" : "Mouvements"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-300">
          <p className="text-sm text-muted-foreground">Sorties ce mois</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.monthExits}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.monthExits === 0 ? "Aucun mouvement" : stats.monthExits === 1 ? "Mouvement" : "Mouvements"}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 animate-slide-up opacity-0 delay-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un mouvement..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="entry">Entrées</SelectItem>
                <SelectItem value="exit">Sorties</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="today">
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {permissions.canCreateStockMovement && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => openModal("entry")}>
                <ArrowUpCircle className="w-4 h-4" />
                Entrée
              </Button>
              <Button className="btn-accent gap-2" onClick={() => openModal("exit")}>
                <ArrowDownCircle className="w-4 h-4" />
                Sortie
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Movements Table */}
      {filteredMovements.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun mouvement"
          description="Les mouvements de stock apparaîtront ici"
          actionLabel="Ajouter un mouvement"
          onAction={() => openModal("entry")}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up opacity-0 delay-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Date/Heure</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Produit</TableHead>
              <TableHead className="font-semibold text-center">Quantité</TableHead>
              <TableHead className="font-semibold">Raison</TableHead>
              <TableHead className="font-semibold">Responsable</TableHead>
              <TableHead className="font-semibold">Commentaire</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.map((movement) => (
              <TableRow key={movement._id || movement.id} className="table-row">
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(movement.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {movement.type === "entry" ? (
                      <>
                        <ArrowUpCircle className="w-4 h-4 text-success" />
                        <span className="badge-success">Entrée</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownCircle className="w-4 h-4 text-destructive" />
                        <span className="badge-destructive">Sortie</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-foreground">{movement.productName}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`font-semibold ${
                      movement.type === "entry" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {movement.type === "entry" ? "+" : "-"}
                    {movement.quantity} {movement.unit}s
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{movement.reason}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{movement.userName}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{movement.comment || '-'}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}
      
      {/* Modal de mouvement de stock */}
      <StockMovementModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        type={modalType}
        onSubmit={handleCreateMovement}
      />
    </MainLayout>
  );
}
