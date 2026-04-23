import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Users, Phone, Edit, Trash2, Eye } from "lucide-react";
import { partnerService } from "@/services/partner.service";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePermissions } from "@/hooks/use-permissions";
import PartnerFormModal from "@/components/funds/PartnerFormModal";

function formatPrice(v: number) {
  return new Intl.NumberFormat("fr-GN").format(v) + " GNF";
}

export default function Partners() {
  const permissions = usePermissions();
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => { loadPartners(); }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getAll();
      if (res.success) setPartners(res.data);
    } catch {
      showErrorToast("Erreur", "Impossible de charger les partenaires");
    } finally {
      setLoading(false);
    }
  };

  const filtered = partners.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  );

  const handleSubmit = async (data: any) => {
    try {
      if (selectedPartner) {
        const res = await partnerService.update(selectedPartner._id, data);
        if (res.success) { showSuccessToast("Modifié", "Partenaire modifié"); loadPartners(); }
      } else {
        const res = await partnerService.create(data);
        if (res.success) { showSuccessToast("Créé", "Partenaire ajouté avec succès"); loadPartners(); }
      }
    } catch (e: any) {
      showErrorToast("Erreur", e.response?.data?.message || "Une erreur est survenue");
    }
  };

  const handleDelete = async () => {
    if (!selectedPartner) return;
    try {
      const res = await partnerService.delete(selectedPartner._id);
      if (res.success) {
        showSuccessToast("Supprimé", `${selectedPartner.name} supprimé`);
        setDeleteDialog(false);
        loadPartners();
      }
    } catch (e: any) {
      showErrorToast("Erreur", e.response?.data?.message || "Impossible de supprimer");
    }
  };

  if (loading) return (
    <MainLayout title="Partenaires" subtitle="Gestion de vos partenaires financiers">
      <LoadingSpinner size="lg" text="Chargement..." />
    </MainLayout>
  );

  return (
    <MainLayout title="Partenaires" subtitle="Gestion de vos partenaires financiers de confiance">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total partenaires</p>
          <p className="text-2xl font-bold text-foreground mt-1">{partners.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Partenaires actifs</p>
          <p className="text-2xl font-bold text-foreground mt-1">{partners.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total reçu</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatPrice(partners.reduce((s, p) => s + (p.totalSent || 0), 0))}
          </p>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un partenaire..." className="pl-10"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          {(permissions.role === 'admin' || permissions.role === 'gestionnaire') && (
            <Button className="btn-accent gap-2" onClick={() => { setSelectedPartner(null); setModalOpen(true); }}>
              <Plus className="w-4 h-4" />
              Nouveau partenaire
            </Button>
          )}
        </div>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Aucun partenaire"
          description="Ajoutez vos partenaires financiers de confiance"
          actionLabel="Nouveau partenaire"
          onAction={() => { setSelectedPartner(null); setModalOpen(true); }} />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Partenaire</TableHead>
                <TableHead className="font-semibold">Téléphone</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold text-right">Total envoyé</TableHead>
                <TableHead className="font-semibold">Dernière contribution</TableHead>
                <TableHead className="font-semibold text-center">Statut</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(partner => (
                <TableRow key={partner._id} className="table-row">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-amber-600">{partner.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-foreground">{partner.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {partner.phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{partner.description || "—"}</TableCell>
                  <TableCell className="text-right font-semibold text-foreground">{formatPrice(partner.totalSent)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {partner.lastContribution ? new Date(partner.lastContribution).toLocaleDateString("fr-FR") : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={partner.status === 'active' ? 'badge-success' : 'badge-destructive'}>
                      {partner.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {(permissions.role === 'admin' || permissions.role === 'gestionnaire') && (
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { setSelectedPartner(partner); setModalOpen(true); }}>
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                      {permissions.role === 'admin' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { setSelectedPartner(partner); setDeleteDialog(true); }}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PartnerFormModal open={modalOpen} onOpenChange={setModalOpen}
        partner={selectedPartner} onSubmit={handleSubmit} />

      <DeleteConfirmDialog open={deleteDialog} onOpenChange={setDeleteDialog}
        onConfirm={handleDelete} itemName={selectedPartner?.name} />
    </MainLayout>
  );
}
