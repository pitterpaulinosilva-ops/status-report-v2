-- ============================================
-- Status Report FIEA - Database Setup
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create actions table
CREATE TABLE IF NOT EXISTS actions (
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
CREATE TABLE IF NOT EXISTS tasks (
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
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id INTEGER REFERENCES actions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'comment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL, -- 'actions', 'tasks', 'comments'
  record_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_actions_created_by ON actions(created_by);
CREATE INDEX IF NOT EXISTS idx_actions_due_date ON actions(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_action_id ON tasks(action_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_action_id ON comments(action_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Profiles: Everyone can view
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- ACTIONS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Actions are viewable by authenticated users" ON actions;
DROP POLICY IF EXISTS "Authenticated users can create actions" ON actions;
DROP POLICY IF EXISTS "Only admins can update actions" ON actions;
DROP POLICY IF EXISTS "Only admins can delete actions" ON actions;

-- Actions: Authenticated users can view
CREATE POLICY "Actions are viewable by authenticated users"
  ON actions FOR SELECT
  TO authenticated
  USING (true);

-- Actions: Authenticated users can create
CREATE POLICY "Authenticated users can create actions"
  ON actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Actions: Only admins can update
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

-- Actions: Only admins can delete
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

-- ============================================
-- TASKS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tasks are viewable by authenticated users" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Only admins can update tasks" ON tasks;
DROP POLICY IF EXISTS "Only admins can delete tasks" ON tasks;

-- Tasks: Authenticated users can view
CREATE POLICY "Tasks are viewable by authenticated users"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- Tasks: Authenticated users can create
CREATE POLICY "Authenticated users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Tasks: Only admins can update
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

-- Tasks: Only admins can delete
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

-- ============================================
-- COMMENTS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Comments are viewable by authenticated users" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

-- Comments: Authenticated users can view
CREATE POLICY "Comments are viewable by authenticated users"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

-- Comments: Authenticated users can create
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Audit logs are viewable by admins" ON audit_logs;
DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;

-- Audit logs: Only admins can view
CREATE POLICY "Audit logs are viewable by admins"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Audit logs: System can create (via triggers)
CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- AUDIT FUNCTIONS
-- ============================================

-- Function to log actions audit
CREATE OR REPLACE FUNCTION log_action_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data)
    VALUES (auth.uid(), 'delete', TG_TABLE_NAME, OLD.id::TEXT, row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'update', TG_TABLE_NAME, NEW.id::TEXT, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, new_data)
    VALUES (auth.uid(), 'create', TG_TABLE_NAME, NEW.id::TEXT, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUDIT TRIGGERS
-- ============================================

-- Audit trigger for actions
DROP TRIGGER IF EXISTS audit_actions_trigger ON actions;
CREATE TRIGGER audit_actions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON actions
  FOR EACH ROW EXECUTE FUNCTION log_action_audit();

-- Audit trigger for tasks
DROP TRIGGER IF EXISTS audit_tasks_trigger ON tasks;
CREATE TRIGGER audit_tasks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_action_audit();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'actions', 'tasks', 'comments');

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'actions', 'tasks', 'comments');

-- Verify policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- DONE!
-- ============================================
-- Próximo passo: Criar primeiro usuário admin
-- 1. Vá em Authentication > Users
-- 2. Clique em "Add user" > "Create new user"
-- 3. Preencha email e senha
-- 4. Marque "Auto Confirm User"
-- 5. Anote o User UID
-- 6. Execute: UPDATE profiles SET role = 'admin' WHERE id = 'USER_UID';
-- ============================================
