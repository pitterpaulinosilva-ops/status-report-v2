import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas, exigindo autenticação
 * Redireciona para /login se o usuário não estiver autenticado
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#164194] mx-auto" />
          <p className="text-slate-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redireciona para login se não autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>;
};
