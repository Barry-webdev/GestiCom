import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Phone, MapPin, Edit, Trash2, Truck, Package } from "lucide-react";
import { SupplierFormModal } from "@/components/suppliers/SupplierFormModal";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { supplierService } from "@/services/supplier.service";
import { usePermissions } from "@/hooks/use-permissions";

const initialSuppliers: any[] = [];

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <span className="badge-success">Actif</span>;
    case "inactive":
      return <span className="badge-destructive">Inactif</span>;
    default:
      return null;
  }
}

export default function Suppliers() {
  const permissions = usePermissions();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Charger les fournisseurs depuis l'API
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getAll();
      if (response.success) {
        setSuppliers(response.data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      showErrorToast("Erreur", "Impossible de charger les fournisseurs");
    } finally {
      setLoading(false);
    }
  };

  // Calculer les livraisons ce mois
  const deliveriesThisMonth = suppliers.filter(s => {
    if (!s.lastDelivery) return false;
    const deliveryDate = new Date(s.lastDelivery);
    const now = new Date();
    return deliveryDate.getMonth() === now.getMonth() && 
           deliveryDate.getFullYear() === now.getFullYear();
  }).length;

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedSupplier(null);
    setModalOpen(true);
  };

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier);
    setModalOpen(true);
  };

  const handleDeleteClick = (supplier: any) => {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedSupplier) {
        // Modification
        const response = await supplierService.update(selectedSupplier._id || selectedSupplier.id.toString(), data);
        if (response.success) {
          showSuccessToast("Fournisseur modifié", "Les modifications ont été enregistrées");
          loadSuppliers();
        }
      } else {
        // Création
        const response = await supplierService.create(data);
        if (response.success) {
          showSuccessToast("Fournisseur ajouté", "Le fournisseur a été ajouté avec succès");
          loadSuppliers();
        }
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Une erreur est survenue");
    }
  };

  const confirmDelete = async () => {
    if (!selectedSupplier) return;
    
    try {
      const response = await supplierService.delete(selectedSupplier._id || selectedSupplier.id.toString());
      if (response.success) {
        showSuccessToast("Fournisseur supprimé", `${selectedSupplier.name} a été supprimé`);
        setDeleteDialogOpen(false);
        loadSuppliers();
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Impossible de supprimer le fournisseur");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Fournisseurs" subtitle="Gérez vos partenaires d'approvisionnement">
        <LoadingSpinner size="lg" text="Chargement des fournisseurs..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Fournisseurs"
      subtitle="Gérez vos partenaires d'approvisionnement"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0">
          <p className="text-sm text-muted-foreground">Total fournisseurs</p>
          <p className="text-2xl font-bold text-foreground mt-1">{suppliers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Partenaires</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-100">
          <p className="text-sm text-muted-foreground">Fournisseurs actifs</p>
          <p className="text-2xl font-bold text-foreground mt-1">{suppliers.filter(s => s.status === "active").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Actifs</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-200">
          <p className="text-sm text-muted-foreground">Livraisons ce mois</p>
          <p className="text-2xl font-bold text-foreground mt-1">{deliveriesThisMonth}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {deliveriesThisMonth === 0 ? "Aucune livraison" : deliveriesThisMonth === 1 ? "Livraison" : "Livraisons"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-300">
          <p className="text-sm text-muted-foreground">Valeur achats</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatPrice(suppliers.reduce((sum, s) => sum + (s.totalValue || 0), 0))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 animate-slide-up opacity-0 delay-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un fournisseur..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {permissions.canCreateSupplier && (
            <Button className="btn-accent gap-2" onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              Nouveau fournisseur
            </Button>
          )}
        </div>
      </div>

      {/* Suppliers Table */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Aucun fournisseur"
          description="Commencez par ajouter votre premier fournisseur"
          actionLabel="Ajouter un fournisseur"
          onAction={handleCreate}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up opacity-0 delay-200">
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
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier._id || supplier.id} className="table-row">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="font-medium text-foreground">{supplier.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-foreground">{supplier.contact}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {supplier.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {supplier.address}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    {supplier.products}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{supplier.lastDelivery}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-foreground">
                    {formatPrice(supplier.totalValue)}
                  </span>
                </TableCell>
                <TableCell className="text-center">{getStatusBadge(supplier.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {permissions.canEditSupplier && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                    {permissions.canDeleteSupplier && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteClick(supplier)}
                      >
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

      {/* Modals */}
      <SupplierFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        supplier={selectedSupplier}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={selectedSupplier?.name}
      />
    </MainLayout>
  );
}
