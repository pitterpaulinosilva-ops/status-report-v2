# Guia de Início - Autenticação Supabase

## 📋 Pré-requisitos

- Conta no Supabase (gratuita)
- Projeto atual funcionando
- Node.js e npm instalados

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub
4. Clique em "New Project"
5. Preencha:
   - **Name**: status-report-fiea
   - **Database Password**: (anote em local seguro!)
   - **Region**: South America (São Paulo)
   - **Pricing Plan**: Free
6. Clique em "Create new project"
7. Aguarde ~2 minutos para provisionar

### 2. Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** > **API**
2. Anote:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configurar Variáveis de Ambiente

1. Crie arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Adicione ao `.gitignore`:

```
.env.local
```

### 4. Criar Schema do Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Cole o SQL abaixo e execute:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create actions table
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

-- Create tasks table
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

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id INTEGER REFERENCES actions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'comment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Configurar Row Level Security (RLS)

1. No SQL Editor, execute:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Actions policies
CREATE POLICY "Actions are viewable by authenticated users"
  ON actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create actions"
  ON actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

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

-- Tasks policies
CREATE POLICY "Tasks are viewable by authenticated users"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

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

-- Comments policies
CREATE POLICY "Comments are viewable by authenticated users"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### 6. Instalar Dependências

```bash
npm install @supabase/supabase-js
npm install react-router-dom
```

### 7. Criar Primeiro Usuário Admin

1. No Supabase, vá em **Authentication** > **Users**
2. Clique em "Add user" > "Create new user"
3. Preencha:
   - **Email**: seu-email@exemplo.com
   - **Password**: senha-segura
   - **Auto Confirm User**: ✅ (marque)
4. Clique em "Create user"
5. Anote o **User UID** (ex: `a1b2c3d4-...`)
6. Vá em **SQL Editor** e execute:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'a1b2c3d4-...'; -- Substitua pelo User UID
```

### 8. Próximos Passos

Agora você está pronto para implementar! Siga as tarefas em `tasks.md`:

1. **Phase 4**: Criar Supabase Client
2. **Phase 5**: Criar AuthContext
3. **Phase 6**: Criar LoginPage
4. **Phase 7**: Adicionar Permission Guards
5. **Phase 8**: Migrar Data Hooks

## 📚 Recursos Úteis

- **Documentação Supabase**: https://supabase.com/docs
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript

## 🆘 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou a chave correta (anon/public)
- Verifique se o arquivo .env.local está na raiz
- Reinicie o servidor de desenvolvimento

### Erro: "Row Level Security policy violation"
- Verifique se RLS está ativado
- Verifique se as policies foram criadas
- Verifique se o usuário está autenticado

### Erro: "relation does not exist"
- Verifique se executou todos os SQLs
- Verifique se está no projeto correto
- Recarregue o schema no SQL Editor

## 💡 Dicas

1. **Teste no Supabase Dashboard**: Use o SQL Editor para testar queries
2. **Monitore Logs**: Vá em **Logs** para ver erros em tempo real
3. **Use Postman**: Teste APIs diretamente antes de implementar
4. **Backup**: Exporte schema regularmente (Settings > Database > Backup)

## 🎯 Checklist de Configuração

- [ ] Projeto Supabase criado
- [ ] Credenciais anotadas
- [ ] .env.local configurado
- [ ] Schema do banco criado
- [ ] RLS ativado e policies criadas
- [ ] Dependências instaladas
- [ ] Primeiro usuário admin criado
- [ ] Pronto para implementar!

---

**Próximo passo**: Comece pela **Task 13** (Criar Supabase Client) em `tasks.md`
