// Sistema de cores consistente para todos os gráficos do projeto
// Seguindo as melhores práticas de acessibilidade e design

export const CHART_COLORS = {
  // Cores principais para status
  status: {
    completed: '#10B981',    // Verde - Concluído
    overdue: '#EF4444',      // Vermelho - Em Atraso
    onTime: '#0EA5E9',       // Azul - No Prazo
    dueSoon: '#F59E0B',      // Amarelo - Vence em breve
    pending: '#6B7280'       // Cinza - Pendente
  },

  // Paleta para setores (cores distintas e acessíveis)
  sectors: {
    'SSI': '#3B82F6',                    // Azul
    'Processos': '#10B981',              // Verde
    'Suprimentos': '#F59E0B',            // Amarelo
    'Seg. Patrimonial': '#EF4444',       // Vermelho
    'Governança': '#8B5CF6',             // Roxo
    'Manutenção': '#F97316',             // Laranja
    'Outros': '#94A3B8'                  // Cinza claro
  },

  // Paleta para responsáveis (10 cores distintas)
  responsibles: {
    'Mylena Maria Gitai Soares': '#3B82F6',        // Azul
    'Max Nepomuceno Roque': '#10B981',             // Verde
    'Carolina Mendes de Albuquerque': '#F59E0B',   // Amarelo
    'Pitter Paulino da Silva': '#EF4444',          // Vermelho
    'Talmany Leite Pereira': '#8B5CF6',            // Roxo
    'Fânia Amanda Terto da Silva': '#F97316',      // Laranja
    'Jose Joelcio Silva dos Santos': '#06B6D4',    // Ciano
    'Luciana Nascimento dos Santos': '#84CC16',    // Lima
    'Nice Maria de Santana Cabral': '#EC4899',     // Rosa
    'Tania Rubia Da Silva Laurentino': '#6366F1',  // Índigo
    'Outros': '#94A3B8'                            // Cinza claro
  },

  // Gradientes para KPIs
  gradients: {
    success: {
      from: '#10B981',  // Verde
      to: '#059669'
    },
    warning: {
      from: '#F59E0B',  // Amarelo
      to: '#D97706'
    },
    danger: {
      from: '#EF4444',  // Vermelho
      to: '#DC2626'
    },
    info: {
      from: '#0EA5E9',  // Azul
      to: '#0284C7'
    },
    neutral: {
      from: '#6B7280',  // Cinza
      to: '#4B5563'
    }
  },

  // Cores para tema escuro
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      muted: '#64748b'
    }
  },

  // Cores para tema claro
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#64748b'
    }
  }
};

// Função para obter cor por índice (útil para gráficos dinâmicos)
export const getColorByIndex = (index: number): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'
  ];
  return colors[index % colors.length];
};

// Função para obter cor de setor
export const getSectorColor = (sector: string): string => {
  return CHART_COLORS.sectors[sector as keyof typeof CHART_COLORS.sectors] || CHART_COLORS.sectors['Outros'];
};

// Função para obter cor de responsável
export const getResponsibleColor = (responsible: string): string => {
  return CHART_COLORS.responsibles[responsible as keyof typeof CHART_COLORS.responsibles] || CHART_COLORS.responsibles['Outros'];
};

// Função para obter cor de status
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, keyof typeof CHART_COLORS.status> = {
    'Concluído': 'completed',
    'Em Atraso': 'overdue',
    'No Prazo': 'onTime',
    'Vence em 7 dias': 'dueSoon'
  };
  const mappedStatus = Object.prototype.hasOwnProperty.call(statusMap, status) ? statusMap[status] : null;
  return mappedStatus && Object.prototype.hasOwnProperty.call(CHART_COLORS.status, mappedStatus) 
    ? CHART_COLORS.status[mappedStatus] 
    : CHART_COLORS.status.pending;
};

export default CHART_COLORS;