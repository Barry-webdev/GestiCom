import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Header } from "./Header";
import { OnlineStatusBanner } from "@/components/shared/OnlineStatusBanner";
import { initDB } from "@/lib/offline-storage";
import { refreshAllData } from "@/lib/sync-manager";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialiser la base de données offline au chargement
    initDB().then(() => {
      // Rafraîchir les données si en ligne
      if (navigator.onLine) {
        refreshAllData();
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Banner de statut online/offline */}
      <OnlineStatusBanner />
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      
      <div className="lg:pl-64 transition-all duration-300">
        <Header 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="p-4 sm:p-6 mt-0">{children}</main>
      </div>
    </div>
  );
}
