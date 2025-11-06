# Requirements Document - Autenticação Supabase

## Introduction

Sistema de autenticação e autorização usando Supabase para o Status Report FIEA - ONA 2026, com dois níveis de permissão: Administrador e Usuário Padrão.

## Glossary

- **Supabase**: Plataforma Backend-as-a-Service (BaaS) com autenticação, banco de dados PostgreSQL e APIs
- **Auth**: Sistema de autenticação do Supabase
- **RLS**: Row Level Security - Segurança em nível de linha do PostgreSQL
- **JWT**: JSON Web Token usado para autenticação
- **Role**: Papel/função do usuário no sistema (admin ou user)
- **Session**: Sessão ativa do usuário autenticado

## Requirements

### Requirement 1: Autenticação de Usuários

**User Story:** Como usuário do sistema, quero fazer login com email e senha para acessar o sistema de forma segura.

#### Acceptance Criteria

1. WHEN um usuário acessa o sistema sem estar autenticado, THE Sistema SHALL exibir tela de login
2. WHEN um usuário insere credenciais válidas, THE Sistema SHALL autenticar e redirecionar para dashboard
3. WHEN um usuário insere credenciais inválidas, THE Sistema SHALL exibir mensagem de erro clara
4. WHEN um usuário está autenticado, THE Sistema SHALL manter sessão ativa por 7 dias
5. WHEN um usuário clica em logout, THE Sistema SHALL encerrar sessão e redirecionar para login

### Requirement 2: Níveis de Permissão

**User Story:** Como administrador do sistema, quero que existam dois níveis de acesso (Admin e Usuário Padrão) para controlar permissões.

#### Acceptance Criteria

1. WHEN um usuário é criado, THE Sistema SHALL atribuir role (admin ou user)
2. WHEN um usuário faz login, THE Sistema SHALL carregar permissões baseadas no role
3. WHEN o role é admin, THE Sistema SHALL permitir acesso total (criar, editar, excluir)
4. WHEN o role é user, THE Sistema SHALL permitir apenas visualizar, criar e comentar
5. WHEN o role é user, THE Sistema SHALL ocultar botões de editar e excluir

### Requirement 3: Permissões de Administrador

**User Story:** Como administrador, quero ter acesso total ao sistema para gerenciar todas as ações e tarefas.

#### Acceptance Criteria

1. WHEN usuário é admin, THE Sistema SHALL exibir botão "Editar Ação"
2. WHEN usuário é admin, THE Sistema SHALL exibir botão "Excluir Ação"
3. WHEN usuário é admin, THE Sistema SHALL permitir editar tarefas existentes
4. WHEN usuário é admin, THE Sistema SHALL permitir excluir tarefas existentes
5. WHEN usuário é admin, THE Sistema SHALL permitir gerenciar usuários

### Requirement 4: Permissões de Usuário Padrão

**User Story:** Como usuário padrão, quero visualizar o projeto e adicionar conteúdo, mas sem poder editar ou excluir.

#### Acceptance Criteria

1. WHEN usuário é user, THE Sistema SHALL exibir todas as ações e tarefas (leitura)
2. WHEN usuário é user, THE Sistema SHALL permitir criar nova ação
3. WHEN usuário é user, THE Sistema SHALL permitir criar nova tarefa
4. WHEN usuário é user, THE Sistema SHALL permitir adicionar comentários
5. WHEN usuário é user, THE Sistema SHALL ocultar botões de editar e excluir

### Requirement 5: Integração com Supabase

**User Story:** Como desenvolvedor, quero integrar Supabase para gerenciar autenticação e dados de forma segura.

#### Acceptance Criteria

1. WHEN sistema inicia, THE Sistema SHALL conectar com Supabase usando credenciais
2. WHEN usuário faz login, THE Sistema SHALL usar Supabase Auth
3. WHEN dados são salvos, THE Sistema SHALL usar Supabase Database
4. WHEN RLS está ativo, THE Sistema SHALL aplicar políticas de segurança
5. WHEN sessão expira, THE Sistema SHALL redirecionar para login

### Requirement 6: Migração de Dados

**User Story:** Como desenvolvedor, quero migrar dados do localStorage para Supabase mantendo compatibilidade.

#### Acceptance Criteria

1. WHEN sistema detecta dados no localStorage, THE Sistema SHALL oferecer migração
2. WHEN migração é aceita, THE Sistema SHALL transferir ações para Supabase
3. WHEN migração é aceita, THE Sistema SHALL transferir tarefas para Supabase
4. WHEN migração completa, THE Sistema SHALL limpar localStorage
5. WHEN migração falha, THE Sistema SHALL manter dados no localStorage

### Requirement 7: Interface de Login

**User Story:** Como usuário, quero uma tela de login moderna e intuitiva para acessar o sistema.

#### Acceptance Criteria

1. WHEN tela de login é exibida, THE Sistema SHALL mostrar campos email e senha
2. WHEN tela de login é exibida, THE Sistema SHALL mostrar logo SESI/SENAI
3. WHEN login está processando, THE Sistema SHALL exibir indicador de carregamento
4. WHEN erro ocorre, THE Sistema SHALL exibir mensagem amigável
5. WHEN login é bem-sucedido, THE Sistema SHALL exibir animação de transição

### Requirement 8: Segurança

**User Story:** Como administrador de segurança, quero que o sistema seja seguro contra ataques comuns.

#### Acceptance Criteria

1. WHEN senha é armazenada, THE Sistema SHALL usar hash bcrypt via Supabase
2. WHEN token é gerado, THE Sistema SHALL usar JWT com expiração
3. WHEN API é chamada, THE Sistema SHALL validar token em cada requisição
4. WHEN RLS está ativo, THE Sistema SHALL impedir acesso não autorizado
5. WHEN sessão expira, THE Sistema SHALL limpar tokens do cliente
