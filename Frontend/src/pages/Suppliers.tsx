import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Phone, MapPin, Edit, Trash2, Truck, Package } from "lucide-react";
import { SupplierFormModal } from "@/components/suppliers/SupplierFormModal";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { supplierService } from "@/services/supplier.service";
import { usePermissions } from "@/hooks/use-permissions";
import { useQueryData } from "@/hooks/use-query-data";

function formatPrice(v: number) {
  return new Intl.NumberFormat("fr-GN").format(v) + " GNF";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active": return <span className="badge-success">Actif</span>;
    case "inactive": return <span className="badge-destructive">Inactif</span>;
    default: return null;
  }
}

export default function Suppliers() {
  const permissions = usePermissions();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading, refresh } = useQueryData<any[]>(
    'suppliers',
    async () => {
      const res = await supplierService.getAll();
      return res.success ? res.data : [];
    },
    { staleTime: 2 * 60_000 }
  );
  const suppliers = data ?? [];

  const now = new Date();
  const deliveriesThisMonth = suppliers.filter(s => {
    if (!s.lastDelivery) return false;
    const d = new Date(s.lastDelivery);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (formData: any) => {
    const id = selectedSupplier?._id || selectedSupplier?.id?.toString();
    if (selectedSupplier) {
      qc.setQueryData<any[]>(['suppliers'], old => (old ?? []).map(s => s._id === id ? { ...s, ...formData } : s));
      try {
        await supplierService.update(id, formData);
        showSuccessToast("Fournisseur modifié", "Modifications enregistrées");
        refresh();
      } catch (e: any) { refresh(); showErrorToast("Erreur", e.response?.data?.message || "Impossible de modifier"); }
    } else {
      const tempId = `temp_${Date.now()}`;
      qc.setQueryData<any[]>(['suppliers'], old => [{ ...formData, _id: tempId }, ...(old ?? [])]);
      try {
        await supplierService.create(formData);
        showSuccessToast("Fournisseur ajouté", "Fournisseur ajouté avec succès");
        refresh();
      } catch (e: any) { refresh(); showErrorToast("Erreur", e.response?.data?.message || "Impossible d'ajouter"); }
    }
  };

  const confirmDelete = async () => {
    if (!selectedSupplier) return;
    const id = selectedSupplier._id || selectedSupplier.id?.toString();
    qc.setQueryData<any[]>(['suppliers'], old => (old ?? []).filter(s => s._id !== id));
    setDeleteDialogOpen(false);
    try {
      await supplierService.delete(id);
      showSuccessToast("Fournisseur supprimé", `${selectedSupplier.name} supprimé`);
    } catch (e: any) { refresh(); showErrorToast("Erreur", e.response?.data?.message || "Impossible de supprimer"); }
  };

  if (loading) return (
    <MainLayout title="Fournisseurs" subtitle="Gérez vos partenaires d'approvisionnement">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-xl border border-border p-4 h-24 animate-pulse" />)}
      </div>
      <TableSkeleton rows={5} columns={8} />
    </MainLayout>
  );

  return (
    <MainLayout title="Fournisseurs" subtitle="Gérez vos partenaires d'approvisionnement">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Total fournisseurs</p><p className="text-2xl font-bold mt-1">{suppliers.length}</p></div>
        <div className="bg-card rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Actifs</p><p className="text-2xl font-bold mt-1">{suppliers.filter(s => s.status === "active").length}</p></div>
        <div className="bg-card rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Livraisons ce mois</p><p className="text-2xl font-bold mt-1">{deliveriesThisMonth}</p></div>
        <div className="bg-card rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Valeur achats</p><p className="text-2xl font-bold mt-1">{formatPrice(suppliers.reduce((s, x) => s + (x.totalValue || 0), 0))}</p></div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un fournisseur..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          {permissions.canCreateSupplier && (
            <Button className="btn-accent gap-2" onClick={() => { setSelectedSupplier(null); setModalOpen(true); }}>
              <Plus className="w-4 h-4" />Nouveau fournisseur
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Truck} title="Aucun fournisseur" description="Commencez par ajouter votre premier fournisseur" actionLabel="Ajouter un fournisseur" onAction={() => { setSelectedSupplier(null); setModalOpen(true); }} />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Fournisseur</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Adresse</TableHead>
                <TableHead className="font-semibold text-center">Produits</TableHead>
                <TableHead className="font-semibold">Dernière livraison</TableHead>
                <TableHead className="font-semibold text-right">Valeur totale</TableHead>
                <TableHead className="font-semibold text-center">Statut</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(supplier => (
                <TableRow key={supplier._id || supplier.id} className="table-row">
                  <TableCell><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center"><Truck className="w-5 h-5 text-secondary" /></div><span className="font-medium">{supplier.name}</span></div></TableCell>
                  <TableCell><div><p className="text-sm font-medium">{supplier.contact}</p><div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{supplier.phone}</div></div></TableCell>
                  <TableCell><div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />{supplier.address}</div></TableCell>
                  <TableCell className="text-center"><div className="flex items-center justify-center gap-1 text-sm text-muted-foreground"><Package className="w-4 h-4" />{supplier.products}</div></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{supplier.lastDelivery ? new Date(supplier.lastDelivery).toLocaleDateString('fr-FR') : '—'}</TableCell>
                  <TableCell className="text-right font-semibold">{formatPrice(supplier.totalValue)}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(supplier.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {permissions.canEditSupplier && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedSupplier(supplier); setModalOpen(true); }}><Edit className="w-4 h-4 text-muted-foreground" /></Button>}
                      {permissions.canDeleteSupplier && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedSupplier(supplier); setDeleteDialogOpen(true); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <SupplierFormModal open={modalOpen} onOpenChange={setModalOpen} supplier={selectedSupplier} onSubmit={handleSubmit} />
      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} itemName={selectedSupplier?.name} />
    </MainLayout>
  );
}
