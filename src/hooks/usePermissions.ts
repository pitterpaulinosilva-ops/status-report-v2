import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para verificar permissões do usuário
 * Baseado no role do perfil (admin ou user)
 */
export const usePermissions = () => {
  const { profile, isAdmin } = useAuth();

  /**
   * Verifica se o usuário pode editar ações
   * Apenas admins podem editar
   */
  const canEditAction = () => {
    return isAdmin;
  };

  /**
   * Verifica se o usuário pode deletar ações
   * Apenas admins podem deletar
   */
  const canDeleteAction = () => {
    return isAdmin;
  };

  /**
   * Verifica se o usuário pode criar ações
   * Todos os usuários autenticados podem criar
   */
  const canCreateAction = () => {
    return !!profile;
  };

  /**
   * Verifica se o usuário pode editar tarefas
   * Apenas admins podem editar
   */
  const canEditTask = () => {
    return isAdmin;
  };

  /**
   * Verifica se o usuário pode deletar tarefas
   * Apenas admins podem deletar
   */
  const canDeleteTask = () => {
    return isAdmin;
  };

  /**
   * Verifica se o usuário pode criar tarefas
   * Todos os usuários autenticados podem criar
   */
  const canCreateTask = () => {
    return !!profile;
  };

  /**
   * Verifica se o usuário pode adicionar comentários
   * Todos os usuários autenticados podem comentar
   */
  const canComment = () => {
    return !!profile;
  };

  /**
   * Verifica se o usuário pode gerenciar outros usuários
   * Apenas admins podem gerenciar usuários
   */
  const canManageUsers = () => {
    return isAdmin;
  };

  /**
   * Verifica se o usuário pode visualizar conteúdo
   * Todos os usuários autenticados podem visualizar
   */
  const canView = () => {
    return !!profile;
  };

  return {
    isAdmin,
    canEditAction,
    canDeleteAction,
    canCreateAction,
    canEditTask,
    canDeleteTask,
    canCreateTask,
    canComment,
    canManageUsers,
    canView,
  };
};
