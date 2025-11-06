# 🏥 Status Report FIEA - ONA 2026

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pitterpaulinosilva-ops/status-report-v2)

Sistema de gestão e acompanhamento do Plano de Ação para Manutenção da Certificação ONA 2026.

**🚀 Deploy em 1 clique:** Clique no botão acima para fazer deploy direto na Vercel!

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

### Opção 1: Deploy com 1 Clique (Mais Rápido!)

Clique no botão "Deploy with Vercel" no topo deste README e pronto! ✨

### Opção 2: Deploy Manual

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Importe o repositório: `pitterpaulinosilva-ops/status-report-v2`
4. Clique em "Deploy" (configuração automática via `vercel.json`)

**Pronto!** Não precisa configurar nada. A aplicação funciona imediatamente.

### Opção 3: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### ✅ Recursos Configurados Automaticamente

- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ SPA Routing (todas as rotas redirecionam para index.html)
- ✅ Sem variáveis de ambiente necessárias

## 🛠️ Desenvolvimento Local

### Configuração Inicial

```bash
# 1. Clone o repositório
git clone https://github.com/pitterpaulinosilva-ops/status-report-v2.git
cd status-report-v2

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:8080

**Pronto!** Não precisa configurar variáveis de ambiente. Os dados são salvos automaticamente no localStorage do navegador.

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

## ✨ Funcionalidades

### Gestão de Ações
- ✅ Criar, editar e excluir ações
- ✅ Atribuir responsáveis e setores
- ✅ Definir prazos e status
- ✅ Sistema de alertas de atraso (crítico, moderado, no prazo)
- ✅ Filtros avançados por status, responsável, setor e prazo
- ✅ Ordenação customizável

### Sistema de Tarefas Hierárquicas
- ✅ Criar tarefas e subtarefas ilimitadas
- ✅ Arrastar e soltar para reordenar
- ✅ Marcar como concluída/pendente
- ✅ Progresso visual por ação

### Dashboards e Gráficos
- ✅ Gráfico de status das ações
- ✅ Distribuição por responsável
- ✅ Distribuição por setor
- ✅ Cores únicas e consistentes
- ✅ Totalmente interativo

### Comentários e Histórico
- ✅ Sistema de comentários por ação
- ✅ Histórico de alterações
- ✅ Registro de atividades

### Exportação de Dados
- ✅ Exportar para Excel (.xlsx)
- ✅ Exportar para PDF
- ✅ Exportar para CSV
- ✅ Incluir gráficos no PDF

### Interface
- ✅ Design responsivo (mobile, tablet, desktop)
- ✅ Modo claro/escuro
- ✅ Notificações em tempo real
- ✅ Sidebar moderna e intuitiva
- ✅ Cores oficiais SESI/SENAI

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
