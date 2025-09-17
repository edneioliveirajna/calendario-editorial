import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute renderizado:', { isAuthenticated, isLoading, path: location.pathname });

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Mostrando loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute: Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se estiver autenticado, mostrar o conteúdo protegido
  console.log('✅ ProtectedRoute: Usuário autenticado, mostrando conteúdo');
  return <>{children}</>;
}
