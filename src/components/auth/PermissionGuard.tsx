import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission: 'admin' | 'canEdit' | 'canDelete' | 'canCreate' | 'canComment' | 'canView';
  fallback?: ReactNode;
}

/**
 * Componente que controla a renderização baseado em permissões
 * Renderiza children se o usuário tiver a permissão necessária
 * Renderiza fallback (ou null) se não tiver permissão
 */
export const PermissionGuard = ({ 
  children, 
  permission, 
  fallback = null 
}: PermissionGuardProps) => {
  const permissions = usePermissions();

  let hasPermission = false;

  switch (permission) {
    case 'admin':
      hasPermission = permissions.isAdmin;
      break;
    case 'canEdit':
      hasPermission = permissions.canEditAction() || permissions.canEditTask();
      break;
    case 'canDelete':
      hasPermission = permissions.canDeleteAction() || permissions.canDeleteTask();
      break;
    case 'canCreate':
      hasPermission = permissions.canCreateAction() || permissions.canCreateTask();
      break;
    case 'canComment':
      hasPermission = permissions.canComment();
      break;
    case 'canView':
      hasPermission = permissions.canView();
      break;
    default:
      hasPermission = false;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
