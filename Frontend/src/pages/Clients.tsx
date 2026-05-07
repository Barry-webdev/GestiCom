import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Phone, MapPin, Edit, Trash2, User } from "lucide-react";
import { ClientFormModal } from "@/components/clients/ClientFormModal";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { clientService } from "@/services/client.service";
import { usePermissions } from "@/hooks/use-permissions";
import { useQueryData } from "@/hooks/use-query-data";

function formatPrice(v: number) {
  return new Intl.NumberFormat("fr-GN").format(v) + " GNF";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "vip": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary">VIP</span>;
    case "active": return <span className="badge-success">Actif</span>;
    case "inactive": return <span className="badge-destructive">Inactif</span>;
    default: return null;
  }
}

export default function Clients() {
  const permissions = usePermissions();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading, refresh } = useQueryData<any[]>(
    'clients',
    async () => {
      const res = await clientService.getAll();
      return res.success ? res.data : [];
    },
    { staleTime: 2 * 60_000, offlineEntity: 'clients' }
  );
  const clients = data ?? [];

  const now = new Date();
  const vipClients = clients.filter(c => c.status === "vip").length;
  const totalSpent = clients.reduce((s, c) => s + (c.totalPurchases || 0), 0);
  const averageSpent = clients.length > 0 ? totalSpent / clients.length : 0;
  const activeThisMonth = clients.filter(c => {
    if (!c.lastPurchase) return false;
    const d = new Date(c.lastPurchase);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (formData: any) => {
    const id = selectedClient?._id || selectedClient?.id?.toString();
    if (selectedClient) {
      // Optimistic update
      qc.setQueryData<any[]>(['clients'], old =>
        (old ?? []).map(c => c._id === id ? { ...c, ...formData } : c)
      );
      try {
        await clientService.update(id, formData);
        showSuccessToast("Client modifié", "Modifications enregistrées");
        refresh();
      } catch (e: any) {
        refresh();
        showErrorToast("Erreur", e.response?.data?.message || "Impossible de modifier");
      }
    } else {
      const tempId = `temp_${Date.now()}`;
      qc.setQueryData<any[]>(['clients'], old => [{ ...formData, _id: tempId }, ...(old ?? [])]);
      try {
        await clientService.create(formData);
        showSuccessToast("Client ajouté", "Client ajouté avec succès");
        refresh();
      } catch (e: any) {
        refresh();
        showErrorToast("Erreur", e.response?.data?.message || "Impossible d'ajouter");
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedClient) return;
    const id = selectedClient._id || selectedClient.id?.toString();
    qc.setQueryData<any[]>(['clients'], old => (old ?? []).filter(c => c._id !== id));
    setDeleteDialogOpen(false);
    try {
      await clientService.delete(id);
      showSuccessToast("Client supprimé", `${selectedClient.name} supprimé`);
    } catch (e: any) {
      refresh();
      showErrorToast("Erreur", e.response?.data?.message || "Impossible de supprimer");
    }
  };

  if (loading) return (
    <MainLayout title="Clients" subtitle="Gérez votre portefeuille clients et leur historique">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-xl border border-border p-4 h-24 animate-pulse" />)}
      </div>
      <TableSkeleton rows={6} columns={7} />
    </MainLayout>
  );

  return (
    <MainLayout title="Clients" subtitle="Gérez votre portefeuille clients et leur historique">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Total clients</p><p className="text-2xl font-bold mt-1">{clients.length}</p><p className="text-xs text-muted-foreground mt-1">{clients.filter(c => c.status === "active").length} actifs</p></div>
        <div className="bg-card rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Clients VIP</p><p className="text-2xl font-bold mt-1">{vipClients}</p><p className="text-xs text-muted-foreground mt-1">Top acheteurs</p></div>
        <div className="bg-card rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Actifs ce mois</p><p className="text-2xl font-bold mt-1">{activeThisMonth}</p></div>
        <div className="bg-card rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Valeur moyenne</p><p className="text-2xl font-bold mt-1">{formatPrice(averageSpent)}</p></div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un client..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          {permissions.canCreateClient && (
            <Button className="btn-accent gap-2" onClick={() => { setSelectedClient(null); setModalOpen(true); }}>
              <Plus className="w-4 h-4" />Nouveau client
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={User} title="Aucun client" description="Commencez par ajouter votre premier client" actionLabel="Ajouter un client" onAction={() => { setSelectedClient(null); setModalOpen(true); }} />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Adresse</TableHead>
                <TableHead className="font-semibold text-right">Total achats</TableHead>
                <TableHead className="font-semibold">Dernier achat</TableHead>
                <TableHead className="font-semibold text-center">Statut</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(client => (
                <TableRow key={client._id || client.id} className="table-row">
                  <TableCell><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div><span className="font-medium">{client.name}</span></div></TableCell>
                  <TableCell><div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4" />{client.phone}</div></TableCell>
                  <TableCell><div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />{client.address}</div></TableCell>
                  <TableCell className="text-right font-semibold">{formatPrice(client.totalPurchases)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{client.lastPurchase ? new Date(client.lastPurchase).toLocaleDateString('fr-FR') : '—'}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(client.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {permissions.canEditClient && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedClient(client); setModalOpen(true); }}><Edit className="w-4 h-4 text-muted-foreground" /></Button>}
                      {permissions.canDeleteClient && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedClient(client); setDeleteDialogOpen(true); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ClientFormModal open={modalOpen} onOpenChange={setModalOpen} client={selectedClient} onSubmit={handleSubmit} />
      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} itemName={selectedClient?.name} />
    </MainLayout>
  );
}
