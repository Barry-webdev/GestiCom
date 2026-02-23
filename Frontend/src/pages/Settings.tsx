import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  User,
  Shield,
  Bell,
  Plus,
  Edit,
  Trash2,
  Key,
  UserCheck,
  UserX,
} from "lucide-react";
import { UserFormModal } from "@/components/settings/UserFormModal";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { userService } from "@/services/user.service";
import { companyService } from "@/services/company.service";
import { passwordService } from "@/services/auth.service";
import { usePermissions } from "@/hooks/use-permissions";

const users: any[] = [];

function getRoleBadge(role: string) {
  switch (role) {
    case "admin":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
          Administrateur
        </span>
      );
    case "gestionnaire":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info/20 text-info">
          Gestionnaire
        </span>
      );
    case "vendeur":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
          Vendeur
        </span>
      );
    case "lecteur":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
          Lecteur
        </span>
      );
    default:
      return null;
  }
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

export default function Settings() {
  const permissions = usePermissions();
  const [usersData, setUsersData] = useState(users);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [companyData, setCompanyData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadUsers();
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const response = await companyService.get();
      if (response.success) {
        setCompanyData(response.data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
    }
  };

  const handleSaveCompany = async () => {
    try {
      setSavingCompany(true);
      const response = await companyService.update(companyData);
      if (response.success) {
        showSuccessToast("Entreprise mise à jour", "Les informations ont été enregistrées");
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Impossible de sauvegarder");
    } finally {
      setSavingCompany(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showErrorToast("Erreur", "Tous les champs sont requis");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorToast("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showErrorToast("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      setChangingPassword(true);
      const response = await passwordService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.success) {
        showSuccessToast("Mot de passe modifié", "Votre mot de passe a été changé avec succès");
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Impossible de changer le mot de passe");
    } finally {
      setChangingPassword(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      if (response.success) {
        setUsersData(response.data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      showErrorToast("Erreur", "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedUser) {
        const response = await userService.update(selectedUser._id, data);
        if (response.success) {
          showSuccessToast("Utilisateur modifié", "Les modifications ont été enregistrées");
          loadUsers();
        }
      } else {
        const response = await userService.create(data);
        if (response.success) {
          showSuccessToast("Utilisateur créé", "L'utilisateur a été créé avec succès");
          loadUsers();
        }
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Une erreur est survenue");
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await userService.delete(selectedUser._id);
      if (response.success) {
        showSuccessToast("Utilisateur supprimé", `${selectedUser.name} a été supprimé`);
        setDeleteDialogOpen(false);
        loadUsers();
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Impossible de supprimer l'utilisateur");
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const response = await userService.toggleStatus(user._id);
      if (response.success) {
        showSuccessToast(
          "Statut modifié",
          `${user.name} a été ${user.status === 'active' ? 'désactivé' : 'activé'}`
        );
        loadUsers();
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showErrorToast("Erreur", error.response?.data?.message || "Impossible de modifier le statut");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Paramètres" subtitle="Configurez votre application et gérez les utilisateurs">
        <LoadingSpinner size="lg" text="Chargement..." />
      </MainLayout>
    );
  }
  return (
    <MainLayout
      title="Paramètres"
      subtitle="Configurez votre application et gérez les utilisateurs"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Sections */}
        <div className="lg:col-span-1 space-y-6">
          {/* Company Info */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Entreprise</h3>
                <p className="text-sm text-muted-foreground">Informations générales</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-name">Nom de l'entreprise</Label>
                <Input 
                  id="company-name" 
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="company-phone">Téléphone</Label>
                <Input 
                  id="company-phone" 
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="company-address">Adresse</Label>
                <Input 
                  id="company-address" 
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="company-email">Email (optionnel)</Label>
                <Input 
                  id="company-email" 
                  type="email"
                  value={companyData.email || ''}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  className="mt-1" 
                />
              </div>
              <Button 
                className="w-full btn-primary" 
                onClick={handleSaveCompany}
                disabled={savingCompany}
              >
                {savingCompany ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-sm text-muted-foreground">Alertes et rappels</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Alerte stock bas</p>
                  <p className="text-sm text-muted-foreground">Quand un produit atteint le seuil</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Alerte rupture</p>
                  <p className="text-sm text-muted-foreground">Stock à zéro</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Rapport journalier</p>
                  <p className="text-sm text-muted-foreground">Récapitulatif par email</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Sécurité</h3>
                <p className="text-sm text-muted-foreground">Mot de passe et accès</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmer</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="mt-1" 
                />
              </div>
              <Button 
                className="w-full btn-primary" 
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? "Changement..." : "Changer le mot de passe"}
              </Button>
            </div>
          </div>
        </div>

        {/* Users Management */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up opacity-0 delay-100">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Gestion des utilisateurs</h3>
                    <p className="text-sm text-muted-foreground">
                      Créez et gérez les comptes utilisateurs
                    </p>
                  </div>
                </div>
                <Button className="btn-accent gap-2" onClick={handleCreate}>
                  <Plus className="w-4 h-4" />
                  Nouvel utilisateur
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Utilisateur</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Rôle</TableHead>
                  <TableHead className="font-semibold text-center">Statut</TableHead>
                  <TableHead className="font-semibold">Créé le</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData.map((user) => (
                  <TableRow key={user._id} className="table-row">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-foreground">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{user.phone}</span>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          title="Modifier"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        {user.status === "active" ? (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title="Désactiver"
                            onClick={() => handleToggleStatus(user)}
                          >
                            <UserX className="w-4 h-4 text-warning" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title="Activer"
                            onClick={() => handleToggleStatus(user)}
                          >
                            <UserCheck className="w-4 h-4 text-success" />
                          </Button>
                        )}
                        {user.role !== "admin" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title="Supprimer"
                            onClick={() => handleDeleteClick(user)}
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
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={selectedUser}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={selectedUser?.name}
      />
    </MainLayout>
  );
}
