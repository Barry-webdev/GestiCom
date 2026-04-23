import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, TrendingUp, Building2, Home, Users, ShoppingBag, Trash2, Edit } from "lucide-react";
import { fundEntryService } from "@/services/fundEntry.service";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePermissions } from "@/hooks/use-permissions";
import FundEntryFormModal from "@/components/funds/FundEntryFormModal";

const CATEGORY_LABELS: Record<string, string> = {
  magasin: "Magasin",
  etablissement: "Établissement",
  residence: "Résidence",
  partenaire: "Partenaire",
};

const CATEGORY_ICONS: Record<string, any> = {
  magasin: ShoppingBag,
  etablissement: Building2,
  residence: Home,
  partenaire: Users,
};

const CATEGORY_COLORS: Record<string, string> = {
  magasin: "bg-blue-500/10 text-blue-600",
  etablissement: "bg-purple-500/10 text-purple-600",
  residence: "bg-green-500/10 text-green-600",
  partenaire: "bg-amber-500/10 text-amber-600",
};

function formatPrice(v: number) {
  return new Intl.NumberFormat("fr-GN").format(v) + " GNF";
}

export default function FundEntries() {
  const permissions = usePermissions();
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [period, setPeriod] = useState<"day" | "month" | "year">("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => { loadData(); }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesRes, statsRes] = await Promise.all([
        fundEntryService.getAll(),
        fundEntryService.getStats(period),
      ]);
      if (entriesRes.success) setEntries(entriesRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (e) {
      showErrorToast("Erreur", "Impossible de charger les entrées de fonds");
    } finally {
      setLoading(false);
    }
  };

  const filtered = entries.filter(e => {
    const matchCat = categoryFilter === "all" || e.category === categoryFilter;
    const matchSearch = e.sourceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.partnerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSubmit = async (data: any) => {
    try {
      if (selectedEntry) {
        const res = await fundEntryService.update(selectedEntry._id, data);
        if (res.success) { showSuccessToast("Modifié", "Entrée modifiée avec succès"); loadData(); }
      } else {
        const res = await fundEntryService.create(data);
        if (res.success) { showSuccessToast("Enregistré", "Entrée de fonds enregistrée"); loadData(); }
      }
    } catch (e: any) {
      showErrorToast("Erreur", e.response?.data?.message || "Une erreur est survenue");
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    try {
      const res = await fundEntryService.delete(selectedEntry._id);
      if (res.success) {
        showSuccessToast("Supprimé", "Entrée supprimée");
        setDeleteDialog(false);
        loadData();
      }
    } catch (e: any) {
      showErrorToast("Erreur", e.response?.data?.message || "Impossible de supprimer");
    }
  };

  if (loading) return (
    <MainLayout title="Entrées de fonds" subtitle="Suivi et gestion de vos sources de financement">
      <LoadingSpinner size="lg" text="Chargement..." />
    </MainLayout>
  );

  return (
    <MainLayout title="Entrées de fonds" subtitle="Suivi et gestion de vos sources de financement">

      {/* Stats par catégorie */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {["magasin", "etablissement", "residence", "partenaire"].map(cat => {
          const Icon = CATEGORY_ICONS[cat];
          const catStats = stats?.byCategory?.find((c: any) => c.category === cat);
          return (
            <div key={cat} className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[cat]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[cat]}</p>
              </div>
              <p className="text-xl font-bold text-foreground">{formatPrice(catStats?.total || 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">{catStats?.count || 0} entrée(s)</p>
            </div>
          );
        })}
      </div>

      {/* Total global */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total global</p>
            <p className="text-2xl font-bold text-foreground">{formatPrice(stats?.totalGlobal || 0)}</p>
          </div>
        </div>
        <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Aujourd'hui</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Barre d'actions */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-10" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="magasin">Magasin</SelectItem>
                <SelectItem value="etablissement">Établissement</SelectItem>
                <SelectItem value="residence">Résidence</SelectItem>
                <SelectItem value="partenaire">Partenaire</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(permissions.role === 'admin' || permissions.role === 'gestionnaire') && (
            <Button className="btn-accent gap-2" onClick={() => { setSelectedEntry(null); setModalOpen(true); }}>
              <Plus className="w-4 h-4" />
              Nouvelle entrée
            </Button>
          )}
        </div>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <EmptyState icon={TrendingUp} title="Aucune entrée de fonds"
          description="Enregistrez votre première entrée de fonds"
          actionLabel="Nouvelle entrée"
          onAction={() => { setSelectedEntry(null); setModalOpen(true); }} />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Catégorie</TableHead>
                <TableHead className="font-semibold">Source</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold text-right">Montant</TableHead>
                <TableHead className="font-semibold">Enregistré par</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(entry => {
                const Icon = CATEGORY_ICONS[entry.category];
                return (
                  <TableRow key={entry._id} className="table-row">
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[entry.category]}`}>
                        <Icon className="w-3 h-3" />
                        {CATEGORY_LABELS[entry.category]}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{entry.sourceName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.description || "—"}</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{formatPrice(entry.amount)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.userName}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {(permissions.role === 'admin' || permissions.role === 'gestionnaire') && (
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => { setSelectedEntry(entry); setModalOpen(true); }}>
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        )}
                        {permissions.role === 'admin' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => { setSelectedEntry(entry); setDeleteDialog(true); }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <FundEntryFormModal open={modalOpen} onOpenChange={setModalOpen}
        entry={selectedEntry} onSubmit={handleSubmit} />

      <DeleteConfirmDialog open={deleteDialog} onOpenChange={setDeleteDialog}
        onConfirm={handleDelete} itemName="cette entrée de fonds" />
    </MainLayout>
  );
}
