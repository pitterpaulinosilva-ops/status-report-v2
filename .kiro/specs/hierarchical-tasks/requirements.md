# Requirements Document - Sistema Hierárquico de Tarefas

## Introduction

Este documento especifica os requisitos para implementar um sistema hierárquico de tarefas dentro do módulo de Plano de Ação do Status Report FIEA ONA Dashboard. O objetivo é permitir que cada ação possa conter múltiplas tarefas (sub-ações) com os mesmos campos e funcionalidades das ações principais, criando uma estrutura pai-filho que facilita o gerenciamento detalhado de atividades complexas.

## Glossary

- **Action (Ação)**: Item principal do plano de ação que representa uma atividade de alto nível
- **Task (Tarefa)**: Sub-item de uma ação que representa uma atividade específica e detalhada
- **Parent Action (Ação Pai)**: Ação que contém uma ou mais tarefas
- **Child Task (Tarefa Filha)**: Tarefa que pertence a uma ação pai
- **Action Card**: Componente visual que exibe uma ação ou tarefa
- **Task List**: Lista de tarefas associadas a uma ação específica
- **Hierarchical View**: Visualização que mostra a relação pai-filho entre ações e tarefas
- **Task Progress**: Progresso calculado baseado nas tarefas concluídas de uma ação
- **Expandable Card**: Card que pode ser expandido para mostrar tarefas filhas

## Requirements

### Requirement 1

**User Story:** Como usuário do sistema, eu quero visualizar tarefas dentro de cada ação, para que eu possa gerenciar atividades complexas de forma mais detalhada e organizada.

#### Acceptance Criteria

1. WHEN uma ação possui tarefas associadas, THE System SHALL exibir um indicador visual no Action Card mostrando a quantidade de tarefas
2. WHEN o usuário clica no indicador de tarefas, THE System SHALL expandir o Action Card e exibir a lista de tarefas filhas
3. WHEN a lista de tarefas é exibida, THE System SHALL mostrar cada tarefa com os mesmos campos da ação pai (id, título, responsável, setor, prazo, status)
4. WHEN uma ação não possui tarefas, THE System SHALL exibir o Action Card no formato padrão sem indicador de tarefas
5. WHEN o usuário clica novamente no indicador, THE System SHALL recolher a lista de tarefas e retornar ao estado original

### Requirement 2

**User Story:** Como usuário do sistema, eu quero que o progresso da ação seja calculado automaticamente baseado nas tarefas concluídas, para que eu possa acompanhar o andamento de forma visual e precisa.

#### Acceptance Criteria

1. WHEN uma ação possui tarefas, THE System SHALL calcular o percentual de conclusão baseado nas tarefas com status "Concluído"
2. WHEN todas as tarefas estão concluídas, THE System SHALL exibir a ação com 100% de progresso
3. WHEN nenhuma tarefa está concluída, THE System SHALL exibir a ação com 0% de progresso
4. THE System SHALL exibir uma barra de progresso visual no Action Card mostrando o percentual calculado
5. THE System SHALL atualizar o progresso automaticamente quando o status de uma tarefa for alterado

### Requirement 3

**User Story:** Como usuário do sistema, eu quero adicionar, editar e remover tarefas de uma ação, para que eu possa manter o plano de ação atualizado conforme as necessidades do projeto.

#### Acceptance Criteria

1. WHEN o usuário está visualizando as tarefas de uma ação, THE System SHALL exibir um botão "Adicionar Tarefa"
2. WHEN o usuário clica em "Adicionar Tarefa", THE System SHALL abrir um formulário modal com os campos necessários
3. THE System SHALL validar que todos os campos obrigatórios estão preenchidos antes de salvar
4. WHEN o usuário clica em uma tarefa existente, THE System SHALL permitir editar os campos da tarefa
5. WHEN o usuário clica no botão de remover tarefa, THE System SHALL solicitar confirmação antes de excluir

### Requirement 4

**User Story:** Como usuário do sistema, eu quero que as tarefas sejam filtradas e ordenadas junto com as ações, para que eu possa encontrar informações específicas rapidamente.

#### Acceptance Criteria

1. WHEN o usuário aplica um filtro de busca, THE System SHALL filtrar tanto ações quanto tarefas que correspondam ao critério
2. WHEN uma tarefa corresponde ao filtro mas a ação pai não, THE System SHALL exibir a ação pai automaticamente expandida
3. WHEN o usuário ordena por data de vencimento, THE System SHALL considerar as datas das tarefas na ordenação
4. WHEN o usuário filtra por status, THE System SHALL incluir tarefas que correspondam ao status selecionado
5. WHEN o usuário filtra por responsável, THE System SHALL incluir tarefas do responsável selecionado

### Requirement 5

**User Story:** Como usuário do sistema, eu quero que o status da ação reflita o status das tarefas, para que eu possa identificar rapidamente ações que precisam de atenção.

#### Acceptance Criteria

1. WHEN uma ação possui tarefas em atraso, THE System SHALL exibir um indicador de alerta na ação pai
2. WHEN todas as tarefas estão no prazo, THE System SHALL exibir a ação com status "No Prazo"
3. WHEN pelo menos uma tarefa está em atraso, THE System SHALL exibir a ação com status "Em Atraso"
4. WHEN todas as tarefas estão concluídas, THE System SHALL exibir a ação com status "Concluído"
5. THE System SHALL atualizar o status da ação automaticamente quando o status de uma tarefa for alterado

### Requirement 6

**User Story:** Como usuário do sistema, eu quero exportar o plano de ação incluindo as tarefas, para que eu possa compartilhar relatórios completos com a equipe.

#### Acceptance Criteria

1. WHEN o usuário exporta para PDF, THE System SHALL incluir as tarefas de cada ação no documento
2. WHEN o usuário exporta para Excel, THE System SHALL criar uma coluna indicando se o item é ação ou tarefa
3. THE System SHALL manter a hierarquia visual no PDF usando indentação
4. THE System SHALL incluir o progresso calculado de cada ação no relatório
5. WHEN uma ação não possui tarefas, THE System SHALL exportar apenas a ação sem linhas adicionais

### Requirement 7

**User Story:** Como usuário do sistema, eu quero que as tarefas sejam persistidas localmente, para que eu não perca as informações ao recarregar a página.

#### Acceptance Criteria

1. WHEN o usuário adiciona uma tarefa, THE System SHALL salvar os dados no localStorage de forma criptografada
2. WHEN o usuário recarrega a página, THE System SHALL restaurar todas as tarefas salvas
3. THE System SHALL manter a associação entre tarefas e ações pai após recarregar
4. WHEN o usuário remove uma tarefa, THE System SHALL remover os dados do localStorage
5. THE System SHALL validar a integridade dos dados ao restaurar do localStorage

### Requirement 8

**User Story:** Como usuário do sistema, eu quero visualizar estatísticas das tarefas no dashboard, para que eu possa ter uma visão geral do progresso do projeto.

#### Acceptance Criteria

1. WHEN o usuário acessa a Visão Geral, THE System SHALL exibir o total de tarefas cadastradas
2. THE System SHALL exibir a quantidade de tarefas concluídas, em atraso e no prazo
3. THE System SHALL calcular a taxa de conclusão considerando ações e tarefas
4. THE System SHALL exibir gráficos que incluam dados de tarefas
5. THE System SHALL permitir filtrar o dashboard para visualizar apenas ações ou incluir tarefas

## Data Model Extension

### Task Interface
```typescript
interface Task {
  id: string;
  parentActionId: number;
  title: string;
  description: string;
  responsible: string;
  sector: string;
  dueDate: string; // formato DD/MM/YYYY
  status: 'Planejado' | 'Em Andamento' | 'Concluído';
  delayStatus: 'Em Atraso' | 'No Prazo' | 'Concluído';
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}
```

### Extended ActionItem Interface
```typescript
interface ActionItem {
  // ... campos existentes
  tasks?: Task[];
  taskProgress?: number; // 0-100
  hasOverdueTasks?: boolean;
}
```

## Technical Constraints

1. As tarefas devem ser armazenadas de forma eficiente para não impactar a performance
2. A interface deve permanecer responsiva mesmo com muitas tarefas
3. A hierarquia deve ser limitada a 2 níveis (ação → tarefa) para evitar complexidade excessiva
4. O sistema deve suportar até 50 tarefas por ação sem degradação de performance
5. As operações de CRUD de tarefas devem ser otimistas (UI atualiza imediatamente)

## Non-Functional Requirements

1. **Performance**: A expansão/recolhimento de tarefas deve ocorrer em menos de 200ms
2. **Usabilidade**: A interface de tarefas deve seguir os mesmos padrões visuais das ações
3. **Acessibilidade**: Todos os controles de tarefas devem ser acessíveis via teclado
4. **Responsividade**: A visualização de tarefas deve funcionar em dispositivos móveis
5. **Segurança**: Os dados das tarefas devem ser criptografados no localStorage
