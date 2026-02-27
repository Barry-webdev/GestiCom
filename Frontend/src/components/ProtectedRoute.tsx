import { Navigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useMemo } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Mémoriser le statut d'authentification pour éviter les re-renders
  const isAuthenticated = useMemo(() => authService.isAuthenticated(), []);

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion si non authentifié
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
