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
import { Plus, Search, Phone, MapPin, Edit, Trash2, User } from "lucide-react";
import { ClientFormModal } from "@/components/clients/ClientFormModal";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { clientService } from "@/services/client.service";
import { usePermissions } from "@/hooks/use-permissions";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "vip":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
          VIP
        </span>
      );
    case "active":
      return <span className="badge-success">Actif</span>;
    case "inactive":
      return <span className="badge-destructive">Inactif</span>;
    default:
      return null;
  }
}

export default function Clients() {
  const permissions = usePermissions();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Charger les clients depuis l'API
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getAll();
      if (response.success) {
        setClients(response.data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      showErrorToast("Erreur", "Impossible de charger les clients");
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const vipClients = clients.filter(c => c.status === "vip").length;
  const totalSpent = clients.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
  const averageSpent = clients.length > 0 ? totalSpent / clients.length : 0;
  
  // Clients actifs ce mois (ceux qui ont fait un achat ce mois)
  const activeThisMonth = clients.filter(c => {
    if (!c.lastPurchase) return false;
    const purchaseDate = new Date(c.lastPurchase);
    const now = new Date();
    return purchaseDate.getMonth() === now.getMonth() && 
           purchaseDate.getFullYear() === now.getFullYear();
  }).length;

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    client.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedClient(null);
    setModalOpen(true);
  };

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleDeleteClick = (client: any) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedClient) {
        // Modification
        const response = await clientService.update(selectedClient._id || selectedClient.id.toString(), data);
        if (response.success) {
          showSuccessToast("Client modifié", "Les modifications ont été enregistrées");
          loadClients();
        }
      } else {
        // Création
        const response = await clientService.create(data);
        if (response.success) {
          showSuccessToast("Client ajouté", "Le client a été ajouté avec succès");
          loadClients();
        }
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Une erreur est survenue");
    }
  };

  const confirmDelete = async () => {
    if (!selectedClient) return;
    
    try {
      const response = await clientService.delete(selectedClient._id || selectedClient.id.toString());
      if (response.success) {
        showSuccessToast("Client supprimé", `${selectedClient.name} a été supprimé`);
        setDeleteDialogOpen(false);
        loadClients();
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Impossible de supprimer le client");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Clients" subtitle="Gérez votre portefeuille clients et leur historique">
        <LoadingSpinner size="lg" text="Chargement des clients..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Clients"
      subtitle="Gérez votre portefeuille clients et leur historique"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0">
          <p className="text-sm text-muted-foreground">Total clients</p>
          <p className="text-2xl font-bold text-foreground mt-1">{clients.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{clients.filter(c => c.status === "active").length} actifs</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-100">
          <p className="text-sm text-muted-foreground">Clients VIP</p>
          <p className="text-2xl font-bold text-foreground mt-1">{vipClients}</p>
          <p className="text-xs text-muted-foreground mt-1">Top acheteurs</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-200">
          <p className="text-sm text-muted-foreground">Actifs ce mois</p>
          <p className="text-2xl font-bold text-foreground mt-1">{activeThisMonth}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeThisMonth === 0 ? "Aucun achat" : activeThisMonth === 1 ? "Client" : "Clients"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up opacity-0 delay-300">
          <p className="text-sm text-muted-foreground">Valeur moyenne</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatPrice(averageSpent)}</p>
          <p className="text-xs text-muted-foreground mt-1">Par client</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 animate-slide-up opacity-0 delay-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un client..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {permissions.canCreateClient && (
            <Button className="btn-accent gap-2" onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              Nouveau client
            </Button>
          )}
        </div>
      </div>

      {/* Products Table */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={User}
          title="Aucun client"
          description="Commencez par ajouter votre premier client"
          actionLabel="Ajouter un client"
          onAction={handleCreate}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up opacity-0 delay-200">
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
            {filteredClients.map((client) => (
              <TableRow key={client._id || client.id} className="table-row">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {client.address}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-foreground">
                    {formatPrice(client.totalPurchases)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{client.lastPurchase}</span>
                </TableCell>
                <TableCell className="text-center">{getStatusBadge(client.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {permissions.canEditClient && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                    {permissions.canDeleteClient && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteClick(client)}
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
      <ClientFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        client={selectedClient}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={selectedClient?.name}
      />
    </MainLayout>
  );
}
