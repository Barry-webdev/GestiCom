import { authService } from '@/services/auth.service';

export type UserRole = 'admin' | 'gestionnaire' | 'vendeur' | 'lecteur';

export function usePermissions() {
  const user = authService.getUser();
  const role: UserRole = user?.role || 'lecteur';

  return {
    role,
    user,
    
    // Permissions produits
    canCreateProduct: role === 'admin' || role === 'gestionnaire',
    canEditProduct: role === 'admin' || role === 'gestionnaire',
    canDeleteProduct: role === 'admin',
    canViewProduct: true, // Tous peuvent voir
    
    // Permissions clients
    canCreateClient: role === 'admin' || role === 'gestionnaire',
    canEditClient: role === 'admin' || role === 'gestionnaire',
    canDeleteClient: role === 'admin',
    canViewClient: true,
    
    // Permissions fournisseurs
    canCreateSupplier: role === 'admin' || role === 'gestionnaire',
    canEditSupplier: role === 'admin' || role === 'gestionnaire',
    canDeleteSupplier: role === 'admin',
    canViewSupplier: true,
    
    // Permissions ventes
    canCreateSale: role === 'admin' || role === 'gestionnaire' || role === 'vendeur',
    canEditSale: role === 'admin' || role === 'gestionnaire',
    canDeleteSale: role === 'admin',
    canViewSale: true,
    
    // Permissions stock
    canCreateStockMovement: role === 'admin' || role === 'gestionnaire',
    canEditStockMovement: role === 'admin' || role === 'gestionnaire',
    canDeleteStockMovement: role === 'admin',
    canViewStockMovement: true,
    
    // Permissions utilisateurs
    canCreateUser: role === 'admin',
    canEditUser: role === 'admin',
    canDeleteUser: role === 'admin',
    canViewUser: role === 'admin' || role === 'gestionnaire',
    
    // Permissions rapports
    canViewReports: true,
    canExportReports: role === 'admin' || role === 'gestionnaire',
    
    // Permissions dashboard
    canViewDashboard: true,
    canViewFinancialStats: role === 'admin' || role === 'gestionnaire',
  };
}
