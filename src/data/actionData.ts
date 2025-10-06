export interface ActionItem {
  id: number;
  action: string;
  followUp: string;
  responsible: string;
  sector: string;
  dueDate: string;
  status: string;
  delayStatus: string;
}

// Plano de Ação: Manutenção da Certificação ONA 2026
// Código PA: 26203
// Link EPA: https://sistemafiea.sysepa.com.br/epa/incluir_plano_acao.php?codigo=26203&objetivo=

export const actionData: ActionItem[] = [
  { 
    id: 26203, 
    action: "Manutenção da Certificação ONA 2026", 
    followUp: "Plano principal para manutenção da certificação ONA até 2026, coordenando todas as ações necessárias para atender aos requisitos de acreditação.", 
    responsible: "carolina.albuquerque", 
    sector: "Segurança e Saúde para Indústria", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  },
  { 
    id: 26204, 
    action: "Definir e implementar sistemática de acompanhamento das comissões e diretrizes institucionais Plano de Segurança do Paciente e PCIRAS", 
    followUp: "Implementação de sistemática estruturada para acompanhamento das comissões NSP (Núcleo de Segurança do Paciente) e CCIRAS (Comissão de Controle de Infecção Relacionada à Assistência à Saúde), garantindo o cumprimento das diretrizes institucionais.", 
    responsible: "mylena.soares", 
    sector: "Segurança e Saúde para Indústria", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  },
  { 
    id: 26205, 
    action: "Fortalecer método de análise, classificação e tratativa de incidentes do Núcleo de Segurança do Paciente NSP", 
    followUp: "Aprimoramento dos processos de análise, classificação e tratamento de incidentes e eventos adversos, fortalecendo a atuação do NSP na promoção da segurança do paciente.", 
    responsible: "mylena.soares", 
    sector: "Segurança e Saúde para Indústria", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  },
  { 
    id: 26206, 
    action: "Estruturar programa de monitoramento da governança clínica", 
    followUp: "Desenvolvimento e implementação de programa estruturado para monitoramento contínuo da governança clínica, assegurando a qualidade e segurança dos processos assistenciais.", 
    responsible: "carolina.albuquerque", 
    sector: "Segurança e Saúde para Indústria", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  },
  { 
    id: 26207, 
    action: "Implementar sistema de gerenciamento de protocolos clínicos e assistenciais", 
    followUp: "Implementação de sistema robusto para gerenciamento, controle e atualização de protocolos clínicos e assistenciais, garantindo padronização e qualidade no atendimento.", 
    responsible: "mylena.soares", 
    sector: "Segurança e Saúde para Indústria", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  },
  { 
    id: 26208, 
    action: "Assegurar a realização de testes de avaliação de eficácia de todos os planos de contingência implementados nas unidades de saúde, bem como a implementação das ações de melhoria", 
    followUp: "Estabelecimento de cronograma e metodologia para testes periódicos de eficácia dos planos de contingência, incluindo análise de resultados e implementação de melhorias identificadas.", 
    responsible: "carolina.albuquerque", 
    sector: "Segurança e Saúde para Indústria", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  },
  { 
    id: 26209, 
    action: "Assegurar o cumprimento das ações previstas no Manual de Auditorias definido pela organização, assegurando registros das auditorias realizadas, bem como tratativa das não conformidades encontradas durante as auditorias", 
    followUp: "Implementação e monitoramento do cumprimento integral do Manual de Auditorias, garantindo execução sistemática, registro adequado e tratamento eficaz das não conformidades identificadas.", 
    responsible: "pitter.silva", 
    sector: "Processos", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  },
  { 
    id: 26210, 
    action: "Analisar as ações definidas no Programa de Controle de Infecções Relacionadas à Assistência à Saúde, estabelecido pela organização, assegurando o cumprimento das atividades previstas, como a realização de visitas técnicas nas áreas assistenciais", 
    followUp: "Análise sistemática e acompanhamento do Programa PCIRAS, garantindo execução de todas as atividades previstas, incluindo visitas técnicas regulares e monitoramento de indicadores.", 
    responsible: "nice.cabral", 
    sector: "Unidade Sesi Cambona", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  },
  { 
    id: 26211, 
    action: "Assegurar que os procedimentos definidos para controle de rastreabilidade dos medicamentos e anestésicos sejam realizados pelos profissionais, considerando a implementação de barreiras e mecanismos que assegurem o registro das informações", 
    followUp: "Implementação e monitoramento de procedimentos rigorosos para rastreabilidade de medicamentos e anestésicos, incluindo barreiras de segurança e mecanismos de registro confiáveis.", 
    responsible: "fania.silva", 
    sector: "Segurança e Saúde para Indústria", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  },
  { 
    id: 26212, 
    action: "Assegurar implementação das ações de melhoria planejadas para a sistemática de registros e evoluções pelos profissionais da Odontologia, assegurando a completude e qualidade das informações registradas no sistema Lifeone", 
    followUp: "Implementação de melhorias na sistemática de registros odontológicos, garantindo completude, qualidade e padronização das informações no sistema Lifeone.", 
    responsible: "marcia.casado", 
    sector: "Unidade Sesi Cambona", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  },
  { 
    id: 26213, 
    action: "Considerar a avaliação da sistemática utilizada para rastreabilidade dos materiais estéreis utilizados nos pacientes, assegurando a identificação dos materiais utilizados em cada procedimento, fortalecendo a segurança do paciente", 
    followUp: "Avaliação e aprimoramento da sistemática de rastreabilidade de materiais estéreis, garantindo identificação precisa dos materiais utilizados em cada procedimento para fortalecer a segurança do paciente.", 
    responsible: "fania.silva", 
    sector: "Segurança e Saúde para Indústria", 
    dueDate: "19/12/2025", 
    status: "Planejado", 
    delayStatus: "No Prazo" 
  }
];

// Informações do Plano de Ação
export const planInfo = {
  name: "Manutenção da Certificação ONA 2026",
  code: "26203",
  epaLink: "https://sistemafiea.sysepa.com.br/epa/incluir_plano_acao.php?codigo=26203&objetivo=",
  totalActions: actionData.length,
  lastUpdate: new Date().toLocaleDateString('pt-BR')
};
