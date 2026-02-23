import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Warehouse,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/" },
  { icon: Package, label: "Produits", path: "/products" },
  { icon: ShoppingCart, label: "Ventes", path: "/sales" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Truck, label: "Fournisseurs", path: "/suppliers" },
  { icon: Warehouse, label: "Stock", path: "/stock" },
  { icon: BarChart3, label: "Rapports", path: "/reports" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-amber-400 flex items-center justify-center shadow-glow">
                <Warehouse className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">Barry & Fils</h1>
                <p className="text-xs text-sidebar-foreground/60">Pita-Guinée</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => onOpenChange(false)}
                      className={cn("sidebar-item", isActive && "active")}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0",
                          isActive && "text-sidebar-primary"
                        )}
                      />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="px-3 py-4 border-t border-sidebar-border">
            <button className="sidebar-item w-full text-destructive/80 hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
