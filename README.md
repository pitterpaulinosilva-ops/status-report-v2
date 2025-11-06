# 🏥 Status Report FIEA - ONA 2026

Sistema de gestão e acompanhamento do Plano de Ação para Manutenção da Certificação ONA 2026.

## 💾 Armazenamento de Dados

Este sistema utiliza **localStorage** para armazenar os dados localmente no navegador. Os dados são salvos automaticamente e persistem entre sessões.

## 🎨 Design Premium SESI/SENAI

Interface moderna e profissional com:
- ✅ Cores oficiais SESI/SENAI (#164194, #52AE32, #E84910)
- ✅ Sidebar clara e moderna com ícone animado
- ✅ Sistema de notificações com alertas de atraso crítico
- ✅ Gráficos com cores únicas por responsável e setor
- ✅ Cabeçalho premium com barra decorativa tricolor
- ✅ Favicon personalizado com ícone ClipboardCheck
- ✅ Sistema de tarefas hierárquicas
- ✅ Totalmente responsivo e acessível

## 🚀 Deploy no Vercel

### Deploy Automático (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Importe o repositório: `pitterpaulinosilva-ops/status-report-v2`
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Clique em "Deploy"

**Pronto!** Não precisa configurar variáveis de ambiente.

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

## 🛠️ Desenvolvimento Local

### Configuração Inicial

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente (veja seção abaixo)
4. Inicie o servidor: `npm run dev`

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

**Importante**: O arquivo `.env.local` já está no `.gitignore` e não será commitado.

### Comandos Disponíveis

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📦 Tecnologias

- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **Recharts** - Gráficos
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas
- **Zod** - Validação de schemas

## 🎯 Funcionalidades

### Gestão de Ações
- ✅ CRUD completo de ações
- ✅ Sistema de tarefas hierárquicas
- ✅ Filtros avançados (status, responsável, setor)
- ✅ Ordenação por múltiplos critérios
- ✅ Busca em tempo real
- ✅ Exportação para Excel

### Notificações Inteligentes
- 🚨 Alertas críticos (>30 dias de atraso)
- ⚠️ Alertas de atraso (qualquer atraso)
- 📅 Vencimento hoje
- ⏰ Vence em breve (1-7 dias)
- 📊 Dashboard de estatísticas

### Visualizações
- 📊 Dashboard executivo com KPIs
- 👥 Análise por responsável
- 🏢 Análise por setor
- 📈 Gráficos interativos
- 🎨 Cores únicas por categoria

### Assistentes IA
- 🤖 Assistente Gemini
- 💬 Assistente Copilot
- 📝 Insights automáticos

## 🎨 Identidade Visual

### Cores Oficiais
- **Azul SESI/SENAI**: #164194
- **Verde SESI**: #52AE32
- **Laranja SENAI**: #E84910

### Tipografia
- **Fonte**: System fonts (Arial, Helvetica, sans-serif)
- **Pesos**: 400 (regular), 600 (semibold), 700 (bold), 900 (black)

### Componentes
- Bordas arredondadas (8px, 12px, 16px)
- Sombras suaves (sm, md, lg, xl)
- Transições de 300ms
- Hover effects com escala

## 📱 Responsividade

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Wide**: > 1536px

## 🔒 Segurança

- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

## 📄 Licença

Desenvolvido por desenvolvedor independente para FIEA.

## 🤝 Suporte

Para suporte, entre em contato através do repositório GitHub.

---

**Status Report FIEA** - Manutenção da Certificação ONA 2026 🏥
