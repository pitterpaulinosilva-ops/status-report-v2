# 🔧 Guia de Solução de Problemas - Status Report FIEA

## ❌ Erro: "Failed to fetch" ou "Erro de conexão com o servidor"

### Causa
O aplicativo não consegue se conectar ao Supabase. Isso geralmente acontece quando:
1. As variáveis de ambiente não foram carregadas
2. O servidor de desenvolvimento não foi reiniciado após adicionar as variáveis
3. Problema de cache do Vite

### ✅ Solução Passo a Passo

#### 1. Verificar Arquivo .env.local

Certifique-se de que o arquivo `.env.local` existe na raiz do projeto com:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://qjlautkateaouiaxamoo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbGF1dGthdGVhb3VpYXhhbW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MDQzNjcsImV4cCI6MjA3Nzk4MDM2N30.7f4IV7bTjjXcr6q-FOi3yNqn9_oJuvJO0hs0hzWuoYk
```

#### 2. Limpar Cache e Reiniciar

```bash
# Parar o servidor (Ctrl + C)

# Limpar cache do Vite
rm -rf node_modules/.vite

# Limpar cache do navegador ou usar aba anônima

# Reiniciar o servidor
npm run dev
```

#### 3. Verificar no Console do Navegador

1. Abra o navegador em `http://localhost:5173`
2. Pressione F12 para abrir DevTools
3. Vá na aba **Console**
4. Procure pela mensagem: `🔧 Supabase Config:`
5. Deve mostrar:
   - `url: ✅ Loaded`
   - `key: ✅ Loaded`

Se mostrar `❌ Missing`, as variáveis não foram carregadas.

#### 4. Testar Conexão Direta

Abra esta URL no navegador:
```
https://qjlautkateaouiaxamoo.supabase.co/auth/v1/health
```

Deve retornar algo como: `{"version":"...","name":"GoTrue"}`

---

## 🔐 Credenciais de Login

### Usuário Administrador (Teste)
```
Email: admin@fiea.com.br
Senha: Admin@2024
```

### Seu Usuário Principal (Admin)
```
Email: pitter.silva@sistemafiea.com.br
Senha: (a senha que você definiu)
```

---

## 🚀 Deploy na Vercel

### Configurar Variáveis de Ambiente

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione:

```
VITE_SUPABASE_URL
https://qjlautkateaouiaxamoo.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbGF1dGthdGVhb3VpYXhhbW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MDQzNjcsImV4cCI6MjA3Nzk4MDM2N30.7f4IV7bTjjXcr6q-FOi3yNqn9_oJuvJO0hs0hzWuoYk
```

5. Marque: **Production**, **Preview**, **Development**
6. Clique em **Save**
7. Faça **Redeploy**

---

## 🔍 Verificar Status do Supabase

### Via Dashboard
1. Acesse: https://supabase.com/dashboard/project/qjlautkateaouiaxamoo
2. Verifique se o status é "Active"
3. Vá em **Authentication** > **Users** para ver os usuários

### Via SQL
Execute no SQL Editor:
```sql
-- Ver usuários admin
SELECT email, role, full_name FROM profiles WHERE role = 'admin';

-- Ver todas as tabelas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

---

## 📞 Suporte

Se o problema persistir:
1. Tire um print do console do navegador (F12)
2. Verifique os logs do terminal onde o `npm run dev` está rodando
3. Verifique se há erros no Supabase Dashboard > Logs

---

## ✅ Checklist de Verificação

- [ ] Arquivo `.env.local` existe e está correto
- [ ] Servidor foi reiniciado após criar/modificar `.env.local`
- [ ] Cache do Vite foi limpo (`rm -rf node_modules/.vite`)
- [ ] Console do navegador mostra "✅ Loaded" para URL e Key
- [ ] URL do Supabase responde em `/auth/v1/health`
- [ ] Variáveis de ambiente configuradas na Vercel (para produção)
- [ ] Projeto Supabase está "Active" no dashboard

---

**Última atualização:** 06/11/2025
**Versão do Supabase:** 2.182.1
**Região:** us-east-2
