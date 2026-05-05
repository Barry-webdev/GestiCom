import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, ArrowUpCircle, ArrowDownCircle, Calendar, Package } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { StockMovementModal } from "@/components/stock/StockMovementModal";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { stockService } from "@/services/stock.service";
import { usePermissions } from "@/hooks/use-permissions";
import { useQueryData } from "@/hooks/use-query-data";

export default function Stock() {
  const permissions = usePermissions();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"entry" | "exit">("entry");

  const { data: movementsData, loading, refresh: refreshMovements } = useQueryData<any[]>(
    'stock',
    async () => {
      const res = await stockService.getAll();
      return res.success ? res.data : [];
    },
    { staleTime: 60_000 }
  );

  const { data: stats, refresh: refreshStats } = useQueryData<any>(
    'stock-stats',
    async () => {
      const res = await stockService.getStats();
      return res.success ? res.data : { todayEntries: 0, todayExits: 0, monthEntries: 0, monthExits: 0 };
    },
    { staleTime: 60_000 }
  );

  const s = stats ?? { todayEntries: 0, todayExits: 0, monthEntries: 0, monthExits: 0 };
  const movements = movementsData ?? [];

  const filtered = movements.filter(m => {
    const matchSearch = m.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "all" || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleCreateMovement = async (data: any) => {
    try {
      const res = await stockService.create(data);
      if (res.success) {
        showSuccessToast("Succès", "Mouvement de stock enregistré");
        qc.invalidateQueries({ queryKey: ['stock'] });
        qc.invalidateQueries({ queryKey: ['stock-stats'] });
        qc.invalidateQueries({ queryKey: ['products'] }); // Stock produit mis à jour
      }
    } catch (e: any) {
      showErrorToast("Erreur", e.response?.data?.message || "Impossible de créer le mouvement");
    }
  };

  if (loading) return (
    <MainLayout title="Mouvements de stock" subtitle="Suivez les entrées et sorties de votre inventaire">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-xl border border-border p-4 h-24 animate-pulse" />)}
      </div>
      <TableSkeleton rows={6} columns={7} />
    </MainLayout>
  );

  return (
    <MainLayout title="Mouvements de stock" subtitle="Suivez les entrées et sorties de votre inventaire">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4"><div className="flex items-center gap-2 mb-2"><ArrowUpCircle className="w-5 h-5 text-success" /><p className="text-sm text-muted-foreground">Entrées aujourd'hui</p></div><p className="text-2xl font-bold">{s.todayEntries}</p></div>
        <div className="bg-card rounded-xl border border-border p-4"><div className="flex items-center gap-2 mb-2"><ArrowDownCircle className="w-5 h-5 text-destructive" /><p className="text-sm text-muted-foreground">Sorties aujourd'hui</p></div><p className="text-2xl font-bold">{s.todayExits}</p></div>
        <div className="bg-card rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Entrées ce mois</p><p className="text-2xl font-bold mt-1">{s.monthEntries}</p></div>
        <div className="bg-card rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Sorties ce mois</p><p className="text-2xl font-bold mt-1">{s.monthExits}</p></div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher un mouvement..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="entry">Entrées</SelectItem>
                <SelectItem value="exit">Sorties</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {permissions.canCreateStockMovement && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => { setModalType("entry"); setIsModalOpen(true); }}><ArrowUpCircle className="w-4 h-4" />Entrée</Button>
              <Button className="btn-accent gap-2" onClick={() => { setModalType("exit"); setIsModalOpen(true); }}><ArrowDownCircle className="w-4 h-4" />Sortie</Button>
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="Aucun mouvement" description="Les mouvements de stock apparaîtront ici" actionLabel="Ajouter un mouvement" onAction={() => { setModalType("entry"); setIsModalOpen(true); }} />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
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
              {filtered.map(m => (
                <TableRow key={m._id || m.id} className="table-row">
                  <TableCell><p className="font-medium">{new Date(m.createdAt).toLocaleDateString("fr-FR")}</p><p className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</p></TableCell>
                  <TableCell><div className="flex items-center gap-2">{m.type === "entry" ? <><ArrowUpCircle className="w-4 h-4 text-success" /><span className="badge-success">Entrée</span></> : <><ArrowDownCircle className="w-4 h-4 text-destructive" /><span className="badge-destructive">Sortie</span></>}</div></TableCell>
                  <TableCell className="font-medium">{m.productName}</TableCell>
                  <TableCell className="text-center"><span className={`font-semibold ${m.type === "entry" ? "text-success" : "text-destructive"}`}>{m.type === "entry" ? "+" : "-"}{m.quantity} {m.unit}s</span></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.reason}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.userName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.comment || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <StockMovementModal open={isModalOpen} onOpenChange={setIsModalOpen} type={modalType} onSubmit={handleCreateMovement} />
    </MainLayout>
  );
}
