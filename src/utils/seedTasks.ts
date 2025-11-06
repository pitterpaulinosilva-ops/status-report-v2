/**
 * Seed Tasks - Adiciona tarefas de exemplo para demonstração
 */

import { TaskStorage } from '@/lib/taskStorage';
import { Task } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';

export const seedExampleTasks = () => {
  // Limpar tarefas existentes
  TaskStorage.clearAllTasks();
  
  // Tarefas para a ação 26203 (Manutenção da Certificação ONA 2026)
  const tasksAction26203: Task[] = [
    {
      id: uuidv4(),
      parentActionId: 26203,
      title: 'Revisar documentação atual da certificação',
      description: 'Analisar toda a documentação existente da certificação ONA e identificar pontos que precisam ser atualizados.',
      responsible: 'carolina.albuquerque',
      sector: 'Segurança e Saúde para Indústria',
      dueDate: '15/11/2025',
      status: 'Em Andamento',
      delayStatus: 'No Prazo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 0,
      comments: []
    },
    {
      id: uuidv4(),
      parentActionId: 26203,
      title: 'Agendar reunião com equipe de auditoria',
      description: 'Organizar reunião inicial com a equipe de auditoria para alinhamento dos requisitos.',
      responsible: 'carolina.albuquerque',
      sector: 'Segurança e Saúde para Indústria',
      dueDate: '20/11/2025',
      status: 'Planejado',
      delayStatus: 'No Prazo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 1,
      comments: []
    },
    {
      id: uuidv4(),
      parentActionId: 26203,
      title: 'Preparar relatório de conformidade',
      description: 'Elaborar relatório detalhado sobre o status de conformidade com os requisitos ONA.',
      responsible: 'mylena.soares',
      sector: 'Segurança e Saúde para Indústria',
      dueDate: '25/11/2025',
      status: 'Planejado',
      delayStatus: 'No Prazo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 2,
      comments: []
    }
  ];
  
  // Tarefas para a ação 26204 (Sistemática de acompanhamento)
  const tasksAction26204: Task[] = [
    {
      id: uuidv4(),
      parentActionId: 26204,
      title: 'Definir cronograma de reuniões do NSP',
      description: 'Estabelecer calendário mensal de reuniões do Núcleo de Segurança do Paciente.',
      responsible: 'mylena.soares',
      sector: 'Segurança e Saúde para Indústria',
      dueDate: '10/11/2025',
      status: 'Concluído',
      delayStatus: 'Concluído',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 0,
      comments: []
    },
    {
      id: uuidv4(),
      parentActionId: 26204,
      title: 'Criar template de ata de reunião',
      description: 'Desenvolver modelo padronizado para registro das reuniões das comissões.',
      responsible: 'mylena.soares',
      sector: 'Segurança e Saúde para Indústria',
      dueDate: '12/11/2025',
      status: 'Em Andamento',
      delayStatus: 'No Prazo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 1,
      comments: []
    }
  ];
  
  // Tarefas para a ação 26205 (Análise de incidentes)
  const tasksAction26205: Task[] = [
    {
      id: uuidv4(),
      parentActionId: 26205,
      title: 'Revisar protocolo de classificação de incidentes',
      description: 'Atualizar o protocolo de classificação de incidentes conforme novas diretrizes.',
      responsible: 'mylena.soares',
      sector: 'Segurança e Saúde para Indústria',
      dueDate: '05/11/2025',
      status: 'Em Andamento',
      delayStatus: 'Em Atraso',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 0,
      comments: []
    },
    {
      id: uuidv4(),
      parentActionId: 26205,
      title: 'Treinar equipe no novo método de análise',
      description: 'Realizar treinamento com a equipe sobre o método atualizado de análise de incidentes.',
      responsible: 'mylena.soares',
      sector: 'Segurança e Saúde para Indústria',
      dueDate: '08/11/2025',
      status: 'Planejado',
      delayStatus: 'Em Atraso',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 1,
      comments: []
    },
    {
      id: uuidv4(),
      parentActionId: 26205,
      title: 'Implementar sistema de registro digital',
      description: 'Configurar e testar sistema digital para registro de incidentes.',
      responsible: 'pitter.silva',
      sector: 'Processos',
      dueDate: '15/11/2025',
      status: 'Planejado',
      delayStatus: 'No Prazo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 2,
      comments: []
    }
  ];
  
  // Salvar todas as tarefas
  const allTasks = [...tasksAction26203, ...tasksAction26204, ...tasksAction26205];
  TaskStorage.saveBulkTasks(allTasks);
  
  console.log(`✅ ${allTasks.length} tarefas de exemplo criadas com sucesso!`);
  console.log('📊 Distribuição:');
  console.log(`   - Ação 26203: ${tasksAction26203.length} tarefas`);
  console.log(`   - Ação 26204: ${tasksAction26204.length} tarefas`);
  console.log(`   - Ação 26205: ${tasksAction26205.length} tarefas`);
  
  return allTasks;
};

// Função para limpar tarefas de exemplo
export const clearExampleTasks = () => {
  TaskStorage.clearAllTasks();
  console.log('🗑️ Todas as tarefas foram removidas');
};
