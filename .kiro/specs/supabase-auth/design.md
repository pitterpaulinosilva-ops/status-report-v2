# Design Document - Autenticação Supabase

## Overview

Sistema de autenticação completo usando Supabase com controle de permissões baseado em roles (admin/user).

## Architecture

### Componentes Principais

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Login Page   │  │ Auth Context │  │ Protected    │ │
│  │              │  │              │  │ Routes       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Permission   │  │ Supabase     │  │ Data Hooks   │ │
│  │ Guards       │  │ Client       │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                   Supabase Backend                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Auth Service │  │ PostgreSQL   │  │ Row Level    │ │
│  │              │  │ Database     │  │ Security     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### Tabela: profiles

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela: actions

```sql
CREATE TABLE actions (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  responsible TEXT NOT NULL,
  sector TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL,
  delay_status TEXT,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela: tasks

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  action_id INTEGER REFERENCES actions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  parent_id TEXT REFERENCES tasks(id),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela: comments

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id INTEGER REFERENCES actions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'comment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

### Profiles

```sql
-- Todos podem ler perfis
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Usuários podem atualizar próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Actions

```sql
-- Todos autenticados podem ler ações
CREATE POLICY "Actions are viewable by authenticated users"
  ON actions FOR SELECT
  TO authenticated
  USING (true);

-- Todos autenticados podem criar ações
CREATE POLICY "Authenticated users can create actions"
  ON actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Apenas admins podem atualizar ações
CREATE POLICY "Only admins can update actions"
  ON actions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Apenas admins podem deletar ações
CREATE POLICY "Only admins can delete actions"
  ON actions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### Tasks

```sql
-- Todos autenticados podem ler tarefas
CREATE POLICY "Tasks are viewable by authenticated users"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- Todos autenticados podem criar tarefas
CREATE POLICY "Authenticated users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Apenas admins podem atualizar tarefas
CREATE POLICY "Only admins can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Apenas admins podem deletar tarefas
CREATE POLICY "Only admins can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### Comments

```sql
-- Todos autenticados podem ler comentários
CREATE POLICY "Comments are viewable by authenticated users"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

-- Todos autenticados podem criar comentários
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

## Components and Interfaces

### 1. AuthContext

```typescript
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
}
```

### 2. LoginPage

- Formulário de login com email/senha
- Logo SESI/SENAI
- Validação de campos
- Feedback de erros
- Loading state

### 3. ProtectedRoute

- Verifica autenticação
- Redireciona para login se não autenticado
- Carrega dados do usuário

### 4. PermissionGuard

```typescript
interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  fallback?: React.ReactNode;
}
```

### 5. Supabase Client

```typescript
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

## Data Flow

### Login Flow

```
1. User enters credentials
2. Call supabase.auth.signInWithPassword()
3. Supabase validates credentials
4. Returns JWT token + user data
5. Store session in localStorage
6. Load user profile from profiles table
7. Redirect to dashboard
```

### Permission Check Flow

```
1. Component renders
2. Check user.role from profile
3. If admin: show all buttons
4. If user: hide edit/delete buttons
5. API calls validate role server-side (RLS)
```

### Data Mutation Flow

```
1. User clicks action button
2. Check permission client-side
3. Call Supabase API
4. RLS validates permission server-side
5. If allowed: execute mutation
6. If denied: return error
7. Update UI with result
```

## Error Handling

### Authentication Errors

- Invalid credentials: "Email ou senha incorretos"
- Network error: "Erro de conexão. Tente novamente"
- Session expired: Redirect to login
- Rate limit: "Muitas tentativas. Aguarde alguns minutos"

### Permission Errors

- Unauthorized: "Você não tem permissão para esta ação"
- Forbidden: "Acesso negado"
- Not found: "Recurso não encontrado"

## Testing Strategy

### Unit Tests

- AuthContext hooks
- Permission guards
- Supabase client functions
- Form validations

### Integration Tests

- Login flow completo
- Logout flow
- Permission checks
- Data mutations com RLS

### E2E Tests

- Login como admin
- Login como user
- Criar ação como user
- Tentar editar como user (deve falhar)
- Editar como admin (deve funcionar)

## Security Considerations

1. **Passwords**: Nunca armazenar em plain text (Supabase usa bcrypt)
2. **Tokens**: JWT com expiração de 1 hora, refresh token de 7 dias
3. **RLS**: Sempre ativo, validação server-side
4. **HTTPS**: Obrigatório em produção
5. **Environment Variables**: Nunca commitar credenciais
6. **Rate Limiting**: Supabase tem rate limiting built-in
7. **SQL Injection**: Prevenido por Supabase client
8. **XSS**: React escapa automaticamente

## Migration Strategy

### Phase 1: Setup Supabase

1. Criar projeto no Supabase
2. Configurar tabelas
3. Ativar RLS
4. Criar policies

### Phase 2: Implement Auth

1. Instalar @supabase/supabase-js
2. Criar AuthContext
3. Criar LoginPage
4. Implementar ProtectedRoute

### Phase 3: Migrate Data

1. Criar script de migração
2. Ler dados do localStorage
3. Inserir no Supabase
4. Validar migração
5. Limpar localStorage

### Phase 4: Update Components

1. Substituir localStorage por Supabase
2. Adicionar permission guards
3. Atualizar hooks (useActionData, useTaskData)
4. Testar fluxos

### Phase 5: Deploy

1. Configurar env variables no Vercel
2. Deploy
3. Testar em produção
4. Monitorar erros
