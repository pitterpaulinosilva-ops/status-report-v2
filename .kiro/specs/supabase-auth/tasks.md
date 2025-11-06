# Implementation Plan - Autenticação Supabase

## Phase 1: Setup e Configuração

- [ ] 1. Configurar Projeto Supabase
  - Criar conta no Supabase (https://supabase.com)
  - Criar novo projeto
  - Anotar URL e anon key
  - Configurar região (preferencialmente South America)
  - _Requirements: 5.1_

- [x] 2. Instalar Dependências



  - Instalar @supabase/supabase-js
  - Instalar @supabase/auth-helpers-react (opcional)
  - Atualizar package.json


  - _Requirements: 5.1_

- [ ] 3. Configurar Variáveis de Ambiente
  - Criar arquivo .env.local
  - Adicionar VITE_SUPABASE_URL
  - Adicionar VITE_SUPABASE_ANON_KEY
  - Adicionar .env.local ao .gitignore
  - Documentar variáveis no README


  - _Requirements: 5.1, 8.5_

## Phase 2: Database Schema



- [ ] 4. Criar Tabela Profiles
  - Executar SQL para criar tabela profiles
  - Adicionar trigger para criar profile ao registrar
  - Configurar índices
  - _Requirements: 2.1, 5.3_



- [ ] 5. Criar Tabela Actions
  - Executar SQL para criar tabela actions
  - Migrar estrutura do localStorage


  - Adicionar foreign keys
  - Configurar índices
  - _Requirements: 5.3, 6.2_

- [ ] 6. Criar Tabela Tasks
  - Executar SQL para criar tabela tasks


  - Adicionar suporte a hierarquia
  - Configurar cascade delete
  - _Requirements: 5.3, 6.3_

- [x] 7. Criar Tabela Comments


  - Executar SQL para criar tabela comments
  - Adicionar foreign keys
  - Configurar índices
  - _Requirements: 4.4, 5.3_



## Phase 3: Row Level Security

- [ ] 8. Ativar RLS em Todas as Tabelas
  - Ativar RLS na tabela profiles
  - Ativar RLS na tabela actions


  - Ativar RLS na tabela tasks
  - Ativar RLS na tabela comments
  - _Requirements: 5.4, 8.4_

- [ ] 9. Criar Policies para Profiles
  - Policy de leitura (todos)


  - Policy de atualização (próprio perfil)
  - Testar policies
  - _Requirements: 2.2, 5.4_

- [ ] 10. Criar Policies para Actions
  - Policy de leitura (autenticados)


  - Policy de criação (autenticados)
  - Policy de atualização (apenas admin)
  - Policy de exclusão (apenas admin)
  - Testar policies
  - _Requirements: 3.1, 3.2, 4.2, 5.4_




- [ ] 11. Criar Policies para Tasks
  - Policy de leitura (autenticados)
  - Policy de criação (autenticados)
  - Policy de atualização (apenas admin)


  - Policy de exclusão (apenas admin)
  - Testar policies
  - _Requirements: 3.3, 3.4, 4.3, 5.4_

- [ ] 12. Criar Policies para Comments
  - Policy de leitura (autenticados)
  - Policy de criação (autenticados)
  - Testar policies

  - _Requirements: 4.4, 5.4_

## Phase 4: Supabase Client

- [x] 13. Criar Supabase Client


  - Criar arquivo src/lib/supabase.ts
  - Configurar createClient com env vars
  - Exportar client singleton
  - Adicionar tipos TypeScript
  - _Requirements: 5.1, 5.2_

- [ ] 14. Criar Types para Database
  - Gerar types do Supabase


  - Criar interfaces para Profile, Action, Task, Comment
  - Exportar types
  - _Requirements: 5.1_

## Phase 5: Authentication Context

- [ ] 15. Criar AuthContext
  - Criar src/contexts/AuthContext.tsx
  - Implementar AuthProvider


  - Adicionar state para user, profile, isLoading
  - Implementar signIn function
  - Implementar signOut function
  - Implementar signUp function
  - Adicionar listener para auth state changes


  - _Requirements: 1.2, 1.4, 1.5, 2.2_

- [ ] 16. Criar Hook useAuth
  - Criar src/hooks/useAuth.ts
  - Exportar hook que usa AuthContext
  - Adicionar validação de contexto
  - _Requirements: 1.2_




- [ ] 17. Criar Hook usePermissions
  - Criar src/hooks/usePermissions.ts
  - Implementar isAdmin check
  - Implementar canEdit check


  - Implementar canDelete check
  - Implementar canCreate check
  - _Requirements: 2.3, 2.4, 2.5, 3.1-3.5, 4.1-4.5_


## Phase 6: Login Page

- [ ] 18. Criar Componente LoginPage
  - Criar src/pages/LoginPage.tsx
  - Adicionar logo SESI/SENAI


  - Criar formulário com email e senha

  - Adicionar validação de campos
  - Implementar submit handler
  - Adicionar loading state
  - Adicionar error handling


  - Estilizar com Tailwind (padrão SESI/SENAI)
  - _Requirements: 1.1, 1.2, 1.3, 7.1-7.5_

- [ ] 19. Criar Componente ProtectedRoute
  - Criar src/components/auth/ProtectedRoute.tsx
  - Verificar autenticação


  - Redirecionar para login se não autenticado
  - Mostrar loading enquanto verifica
  - _Requirements: 1.1, 5.5_

- [ ] 20. Atualizar App.tsx com Rotas
  - Instalar react-router-dom (se não instalado)



  - Configurar BrowserRouter
  - Adicionar rota /login
  - Proteger rota / com ProtectedRoute
  - Adicionar AuthProvider no topo



  - _Requirements: 1.1, 1.2_

## Phase 7: Permission Guards

- [ ] 21. Criar Componente PermissionGuard
  - Criar src/components/auth/PermissionGuard.tsx
  - Verificar role do usuário


  - Renderizar children se permitido
  - Renderizar fallback se não permitido
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 22. Atualizar ActionCard com Guards
  - Envolver botão "Editar" com PermissionGuard (admin only)



  - Envolver botão "Excluir" com PermissionGuard (admin only)
  - Manter botão "Ver Detalhes" visível para todos
  - _Requirements: 3.1, 3.2, 4.5_

- [ ] 23. Atualizar ActionDetailsModal com Guards
  - Envolver botão "Editar Ação" com PermissionGuard (admin only)


  - Manter visualização disponível para todos
  - Manter comentários disponíveis para todos
  - _Requirements: 3.1, 4.1, 4.4_

- [ ] 24. Atualizar TaskList com Guards
  - Envolver botões de editar tarefa com PermissionGuard (admin only)
  - Envolver botões de excluir tarefa com PermissionGuard (admin only)
  - Manter botão "Nova Tarefa" visível para todos
  - _Requirements: 3.3, 3.4, 4.3_




## Phase 8: Data Hooks com Supabase

- [ ] 25. Atualizar useActionData
  - Substituir localStorage por Supabase
  - Implementar fetch de actions
  - Implementar realtime subscriptions
  - Adicionar error handling
  - Manter compatibilidade com código existente
  - _Requirements: 5.3, 6.2_

- [ ] 26. Atualizar useActionCRUD
  - Implementar create com Supabase
  - Implementar update com Supabase (verificar permissão)
  - Implementar delete com Supabase (verificar permissão)
  - Adicionar created_by ao criar
  - Adicionar error handling
  - _Requirements: 3.1-3.4, 4.2, 5.3_

- [ ] 27. Atualizar useTaskData
  - Substituir localStorage por Supabase
  - Implementar fetch de tasks
  - Implementar realtime subscriptions
  - Adicionar error handling
  - _Requirements: 5.3, 6.3_

- [ ] 28. Atualizar useTaskCRUD
  - Implementar create com Supabase
  - Implementar update com Supabase (verificar permissão)
  - Implementar delete com Supabase (verificar permissão)
  - Adicionar created_by ao criar
  - Adicionar error handling
  - _Requirements: 3.3, 3.4, 4.3, 5.3_

## Phase 9: Comments System

- [ ] 29. Criar Hook useComments
  - Criar src/hooks/useComments.ts
  - Implementar fetch de comments
  - Implementar create comment
  - Implementar realtime subscriptions
  - Adicionar error handling
  - _Requirements: 4.4, 5.3_

- [ ] 30. Atualizar ActionDetailsModal com Comments
  - Integrar useComments
  - Exibir comentários do Supabase
  - Permitir adicionar comentários
  - Mostrar autor e timestamp
  - _Requirements: 4.4_

## Phase 10: Migration Tool

- [ ] 31. Criar Script de Migração
  - Criar src/utils/migrateToSupabase.ts
  - Detectar dados no localStorage
  - Ler actions do localStorage
  - Ler tasks do localStorage
  - Inserir no Supabase
  - Validar migração
  - Limpar localStorage após sucesso
  - Adicionar logging
  - _Requirements: 6.1-6.5_

- [ ] 32. Criar UI de Migração
  - Criar componente MigrationModal
  - Detectar dados antigos ao login
  - Exibir modal oferecendo migração
  - Mostrar progresso da migração
  - Exibir resultado (sucesso/erro)
  - _Requirements: 6.1-6.5_

## Phase 11: User Management (Admin)

- [ ] 33. Criar Página de Gerenciamento de Usuários
  - Criar src/pages/UsersPage.tsx
  - Listar todos os usuários
  - Mostrar role de cada usuário
  - Adicionar filtros
  - Proteger com PermissionGuard (admin only)
  - _Requirements: 3.5_

- [ ] 34. Implementar Edição de Roles
  - Adicionar botão "Alterar Role"
  - Criar modal de confirmação
  - Implementar update de role
  - Adicionar validação (não pode remover último admin)
  - _Requirements: 2.1, 3.5_

## Phase 12: Testing

- [ ]* 35. Testes de Autenticação
  - Testar login com credenciais válidas
  - Testar login com credenciais inválidas
  - Testar logout
  - Testar persistência de sessão
  - Testar expiração de sessão
  - _Requirements: 1.1-1.5_

- [ ]* 36. Testes de Permissões
  - Testar acesso admin (todas operações)
  - Testar acesso user (apenas leitura e criação)
  - Testar RLS policies
  - Testar permission guards
  - _Requirements: 2.1-2.5, 3.1-3.5, 4.1-4.5_

- [ ]* 37. Testes de Migração
  - Testar migração com dados válidos
  - Testar migração com dados inválidos
  - Testar rollback em caso de erro
  - _Requirements: 6.1-6.5_

## Phase 13: Documentation

- [ ] 38. Atualizar README
  - Documentar setup do Supabase
  - Documentar variáveis de ambiente
  - Documentar roles e permissões
  - Adicionar guia de migração
  - _Requirements: 5.1_

- [ ] 39. Criar Guia de Usuário
  - Documentar como fazer login
  - Documentar diferenças entre roles
  - Documentar como criar ações/tarefas
  - Documentar como adicionar comentários
  - _Requirements: 1.1, 2.1_

## Phase 14: Deploy

- [ ] 40. Configurar Variáveis no Vercel
  - Adicionar VITE_SUPABASE_URL
  - Adicionar VITE_SUPABASE_ANON_KEY
  - Verificar configuração
  - _Requirements: 5.1_

- [ ] 41. Deploy e Testes em Produção
  - Fazer deploy no Vercel
  - Testar login em produção
  - Testar permissões em produção
  - Monitorar erros
  - _Requirements: 5.1-5.5_

- [ ] 42. Criar Primeiro Usuário Admin
  - Registrar usuário via Supabase Dashboard
  - Atualizar role para 'admin' manualmente
  - Testar login como admin
  - _Requirements: 2.1, 3.1_
