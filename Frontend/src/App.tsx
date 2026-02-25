import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Sales from "./pages/Sales";
import SaleDetail from "./pages/SaleDetail";
import Clients from "./pages/Clients";
import Suppliers from "./pages/Suppliers";
import Stock from "./pages/Stock";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { authService } from "./services/auth.service";

// Configuration optimisée de React Query pour des performances maximales
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Les données restent fraîches pendant 5 minutes
      gcTime: 1000 * 60 * 10, // Cache conservé 10 minutes
      refetchOnWindowFocus: false, // Ne pas recharger au focus
      retry: 1, // Réessayer 1 fois en cas d'erreur
    },
  },
});

const App = () => {
  // Composant pour rediriger vers dashboard si déjà connecté
  const LoginRoute = () => {
    const isAuthenticated = authService.isAuthenticated();
    return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Route de connexion - redirige vers dashboard si déjà connecté */}
            <Route path="/login" element={<LoginRoute />} />
            
            {/* Routes protégées - nécessitent une authentification */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            <Route path="/sales/:id" element={<ProtectedRoute><SaleDetail /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
