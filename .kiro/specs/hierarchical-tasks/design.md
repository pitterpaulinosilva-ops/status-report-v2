# Design Document - Sistema Hierárquico de Tarefas

## Overview

Este documento descreve a arquitetura técnica e o design de implementação do sistema hierárquico de tarefas para o Status Report FIEA ONA Dashboard. O sistema permitirá que cada ação contenha múltiplas tarefas (sub-ações), criando uma estrutura pai-filho que facilita o gerenciamento detalhado de atividades complexas.

A solução será implementada de forma incremental, mantendo compatibilidade com o código existente e seguindo os padrões já estabelecidos no projeto (React, TypeScript, Tailwind CSS, shadcn/ui).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ActionCard   │  │ TaskList     │  │ TaskModal    │      │
│  │ (Enhanced)   │  │ (New)        │  │ (New)        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ useTaskData  │  │ useTaskCRUD  │  │ useTaskStats │      │
│  │ (New Hook)   │  │ (New Hook)   │  │ (New Hook)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ TaskStorage  │  │ ActionData   │  │ TaskValidator│      │
│  │ (New)        │  │ (Extended)   │  │ (New)        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
Index (Page)
├── AdvancedDashboard (Enhanced with task stats)
├── ActionCard (Enhanced)
│   ├── TaskProgressBar (New)
│   ├── TaskIndicator (New)
│   └── TaskList (New - Expandable)
│       └── TaskItem (New)
│           └── TaskDetailsModal (New)
└── ActionDetailsModal (Enhanced with tasks tab)
    └── TaskManagementPanel (New)
```

## Components and Interfaces

### 1. Data Models

#### Task Interface (New)
```typescript
// src/types/task.ts
export interface Task {
  id: string; // UUID format
  parentActionId: number; // Reference to ActionItem.id
  title: string;
  description: string;
  responsible: string;
  sector: string;
  dueDate: string; // DD/MM/YYYY format
  status: 'Planejado' | 'Em Andamento' | 'Concluído';
  delayStatus: 'Em Atraso' | 'No Prazo' | 'Concluído'; // Calculated
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  order: number; // For sorting within parent
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  author: string;
  content: string;
  timestamp: string;
}
```

#### Extended ActionItem Interface
```typescript
// src/data/actionData.ts (Extended)
export interface ActionItem {
  id: number;
  action: string;
  followUp: string;
  responsible: string;
  sector: string;
  dueDate: string;
  status: string;
  delayStatus: string;
  
  // New fields for task support
  tasks?: Task[];
  taskProgress?: number; // 0-100, calculated from tasks
  hasOverdueTasks?: boolean; // Calculated
  totalTasks?: number; // Calculated
  completedTasks?: number; // Calculated
}
```

### 2. Storage Layer

#### TaskStorage Service (New)
```typescript
// src/lib/taskStorage.ts
import { setSecureItem, getSecureItem, removeSecureItem } from '@/lib/encryption';

const TASKS_STORAGE_KEY = 'action-tasks-data';

export interface TaskStorageData {
  tasks: Task[];
  lastUpdated: number;
  version: string; // For migration support
}

export class TaskStorage {
  // Get all tasks
  static getTasks(): Task[] {
    const data = getSecureItem<TaskStorageData>(TASKS_STORAGE_KEY);
    return data?.tasks || [];
  }
  
  // Get tasks for specific action
  static getTasksByActionId(actionId: number): Task[] {
    const tasks = this.getTasks();
    return tasks.filter(task => task.parentActionId === actionId);
  }
  
  // Save task
  static saveTask(task: Task): void {
    const tasks = this.getTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    
    if (existingIndex >= 0) {
      tasks[existingIndex] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      tasks.push({ ...task, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    this.saveTasks(tasks);
  }
  
  // Delete task
  static deleteTask(taskId: string): void {
    const tasks = this.getTasks().filter(t => t.id !== taskId);
    this.saveTasks(tasks);
  }
  
  // Private: Save all tasks
  private static saveTasks(tasks: Task[]): void {
    const data: TaskStorageData = {
      tasks,
      lastUpdated: Date.now(),
      version: '1.0.0'
    };
    setSecureItem(TASKS_STORAGE_KEY, data);
  }
  
  // Clear all tasks (for testing/reset)
  static clearTasks(): void {
    removeSecureItem(TASKS_STORAGE_KEY);
  }
}
```

### 3. Custom Hooks

#### useTaskData Hook (New)
```typescript
// src/hooks/useTaskData.ts
import { useState, useEffect, useMemo } from 'react';
import { Task } from '@/types/task';
import { TaskStorage } from '@/lib/taskStorage';
import { calculateDelayStatus } from '@/lib/utils';

export const useTaskData = (actionId?: number) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load tasks on mount
  useEffect(() => {
    const loadTasks = () => {
      try {
        const allTasks = TaskStorage.getTasks();
        const filteredTasks = actionId 
          ? allTasks.filter(t => t.parentActionId === actionId)
          : allTasks;
        
        // Calculate delay status for each task
        const tasksWithStatus = filteredTasks.map(task => ({
          ...task,
          delayStatus: calculateDelayStatus(task.dueDate, task.status)
        }));
        
        setTasks(tasksWithStatus);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, [actionId]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Concluído').length;
    const overdue = tasks.filter(t => t.delayStatus === 'Em Atraso').length;
    const onTime = tasks.filter(t => t.delayStatus === 'No Prazo').length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    return { total, completed, overdue, onTime, progress };
  }, [tasks]);
  
  return { tasks, stats, isLoading };
};
```

#### useTaskCRUD Hook (New)
```typescript
// src/hooks/useTaskCRUD.ts
import { useState, useCallback } from 'react';
import { Task } from '@/types/task';
import { TaskStorage } from '@/lib/taskStorage';
import { v4 as uuidv4 } from 'uuid';

export const useTaskCRUD = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'delayStatus'>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newTask: Task = {
        ...taskData,
        id: uuidv4(),
        delayStatus: 'No Prazo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      TaskStorage.saveTask(newTask);
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar tarefa';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const tasks = TaskStorage.getTasks();
      const existingTask = tasks.find(t => t.id === taskId);
      
      if (!existingTask) {
        throw new Error('Tarefa não encontrada');
      }
      
      const updatedTask: Task = {
        ...existingTask,
        ...updates,
        id: taskId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };
      
      TaskStorage.saveTask(updatedTask);
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar tarefa';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  const deleteTask = useCallback(async (taskId: string) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      TaskStorage.deleteTask(taskId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir tarefa';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  return { createTask, updateTask, deleteTask, isSubmitting, error };
};
```

### 4. UI Components

#### TaskProgressBar Component (New)
```typescript
// src/components/organisms/TaskProgressBar.tsx
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';

interface TaskProgressBarProps {
  total: number;
  completed: number;
  overdue: number;
  onTime: number;
}

export const TaskProgressBar = ({ total, completed, overdue, onTime }: TaskProgressBarProps) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Progresso das Tarefas
        </span>
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {completed}/{total} ({progress.toFixed(0)}%)
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>{completed} concluídas</span>
        </div>
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
          <Clock3 className="w-3 h-3" />
          <span>{onTime} no prazo</span>
        </div>
        {overdue > 0 && (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-3 h-3" />
            <span>{overdue} em atraso</span>
          </div>
        )}
      </div>
    </div>
  );
};
```

#### TaskList Component (New)
```typescript
// src/components/organisms/TaskList.tsx
import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  isExpanded: boolean;
}

export const TaskList = ({ tasks, onTaskClick, onAddTask, isExpanded }: TaskListProps) => {
  if (!isExpanded) return null;
  
  return (
    <div className="mt-4 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Tarefas ({tasks.length})
        </h4>
        <Button
          size="sm"
          variant="outline"
          onClick={onAddTask}
          className="h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Adicionar Tarefa
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
          Nenhuma tarefa cadastrada. Clique em "Adicionar Tarefa" para começar.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

#### TaskItem Component (New)
```typescript
// src/components/organisms/TaskItem.tsx
import { Task } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { UserCircle2, CalendarCheck2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onClick: () => void;
}

export const TaskItem = ({ task, onClick }: TaskItemProps) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Em Atraso':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'No Prazo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Concluído':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
    }
  };
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all",
        "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700",
        "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-1">
          {task.title}
        </h5>
        <Badge className={cn("text-xs", getStatusClass(task.delayStatus))}>
          {task.delayStatus}
        </Badge>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <UserCircle2 className="w-3 h-3" />
          <span>{task.responsible}</span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarCheck2 className="w-3 h-3" />
          <span>{task.dueDate}</span>
        </div>
      </div>
    </div>
  );
};
```

#### TaskModal Component (New)
```typescript
// src/components/organisms/TaskModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/types/task';
import { useTaskCRUD } from '@/hooks/useTaskCRUD';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentActionId: number;
  task?: Task; // If editing
}

export const TaskModal = ({ isOpen, onClose, onSuccess, parentActionId, task }: TaskModalProps) => {
  const { createTask, updateTask, isSubmitting } = useTaskCRUD();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsible: '',
    sector: '',
    dueDate: '',
    status: 'Planejado' as const
  });
  
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        responsible: task.responsible,
        sector: task.sector,
        dueDate: task.dueDate,
        status: task.status
      });
    }
  }, [task]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (task) {
        await updateTask(task.id, formData);
      } else {
        await createTask({
          ...formData,
          parentActionId,
          order: 0
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Tarefa *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsible">Responsável *</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="sector">Setor *</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="text"
                placeholder="DD/MM/YYYY"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planejado">Planejado</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : task ? 'Atualizar' : 'Criar Tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

### 5. Enhanced ActionCard Component

```typescript
// src/components/organisms/ActionCard.tsx (Enhanced)
// Add these imports and state
import { useState } from 'react';
import { ChevronDown, ChevronUp, ListChecks } from 'lucide-react';
import { useTaskData } from '@/hooks/useTaskData';
import { TaskProgressBar } from './TaskProgressBar';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';

// Inside ActionCard component:
const [isTasksExpanded, setIsTasksExpanded] = useState(false);
const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
const [selectedTask, setSelectedTask] = useState<Task | undefined>();
const { tasks, stats, isLoading } = useTaskData(action.id);

// Add task indicator section before the existing card content
{stats.total > 0 && (
  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
    <button
      onClick={() => setIsTasksExpanded(!isTasksExpanded)}
      className="w-full flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      <div className="flex items-center gap-2">
        <ListChecks className="w-4 h-4" />
        <span>{stats.total} {stats.total === 1 ? 'Tarefa' : 'Tarefas'}</span>
      </div>
      {isTasksExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>
    
    {isTasksExpanded && (
      <>
        <div className="mt-3">
          <TaskProgressBar
            total={stats.total}
            completed={stats.completed}
            overdue={stats.overdue}
            onTime={stats.onTime}
          />
        </div>
        
        <TaskList
          tasks={tasks}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setIsTaskModalOpen(true);
          }}
          onAddTask={() => {
            setSelectedTask(undefined);
            setIsTaskModalOpen(true);
          }}
          isExpanded={isTasksExpanded}
        />
      </>
    )}
  </div>
)}

<TaskModal
  isOpen={isTaskModalOpen}
  onClose={() => {
    setIsTaskModalOpen(false);
    setSelectedTask(undefined);
  }}
  onSuccess={() => {
    // Refresh tasks
    window.location.reload(); // Temporary, will be improved with state management
  }}
  parentActionId={action.id}
  task={selectedTask}
/>
```

## Data Models

### Task Data Structure
```typescript
{
  id: "uuid-v4-string",
  parentActionId: 26203,
  title: "Revisar protocolo de segurança",
  description: "Revisar e atualizar o protocolo de segurança do paciente conforme novas diretrizes",
  responsible: "mylena.soares",
  sector: "Segurança e Saúde para Indústria",
  dueDate: "15/11/2025",
  status: "Em Andamento",
  delayStatus: "No Prazo",
  createdAt: "2025-11-05T10:30:00.000Z",
  updatedAt: "2025-11-05T14:20:00.000Z",
  order: 1,
  comments: []
}
```

### Storage Structure
```typescript
{
  tasks: Task[],
  lastUpdated: 1699185600000,
  version: "1.0.0"
}
```

## Error Handling

### Validation Rules
1. **Title**: Required, min 3 characters, max 200 characters
2. **Responsible**: Required, valid username format
3. **Sector**: Required, min 3 characters
4. **DueDate**: Required, valid DD/MM/YYYY format, not in the past
5. **Status**: Required, one of the allowed values

### Error Messages
```typescript
const ERROR_MESSAGES = {
  TASK_NOT_FOUND: 'Tarefa não encontrada',
  INVALID_DATE: 'Data inválida. Use o formato DD/MM/YYYY',
  REQUIRED_FIELD: 'Este campo é obrigatório',
  STORAGE_ERROR: 'Erro ao salvar dados. Tente novamente.',
  LOAD_ERROR: 'Erro ao carregar tarefas',
  DELETE_CONFIRM: 'Tem certeza que deseja excluir esta tarefa?'
};
```

## Testing Strategy

### Unit Tests
1. TaskStorage service methods
2. useTaskData hook calculations
3. useTaskCRUD hook operations
4. Task validation functions
5. Date calculation utilities

### Integration Tests
1. Task creation flow
2. Task update flow
3. Task deletion flow
4. Task list filtering
5. Progress calculation

### Component Tests
1. TaskProgressBar rendering
2. TaskList expand/collapse
3. TaskItem click handling
4. TaskModal form submission
5. ActionCard with tasks

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Tasks are only loaded when ActionCard is expanded
2. **Memoization**: Use useMemo for expensive calculations (progress, stats)
3. **Debouncing**: Debounce search/filter operations
4. **Virtual Scrolling**: Implement if task lists exceed 50 items
5. **Optimistic Updates**: Update UI immediately, sync with storage async

### Performance Metrics
- Task list render: < 100ms
- Task creation: < 200ms
- Task update: < 150ms
- Storage operations: < 50ms
- Progress calculation: < 10ms

## Security Considerations

1. **Data Encryption**: All task data encrypted in localStorage using existing encryption service
2. **Input Sanitization**: Sanitize all user inputs before storage
3. **XSS Prevention**: Use React's built-in XSS protection
4. **Data Validation**: Validate all data on client-side before storage
5. **Access Control**: Future enhancement for role-based access

## Migration Strategy

### Phase 1: Foundation (Week 1)
- Create data models and types
- Implement TaskStorage service
- Create custom hooks (useTaskData, useTaskCRUD)
- Add unit tests

### Phase 2: UI Components (Week 2)
- Create TaskProgressBar component
- Create TaskList component
- Create TaskItem component
- Create TaskModal component
- Add component tests

### Phase 3: Integration (Week 3)
- Enhance ActionCard with task support
- Update filtering logic to include tasks
- Update export functionality
- Integration testing

### Phase 4: Dashboard & Polish (Week 4)
- Update AdvancedDashboard with task statistics
- Add task-related charts
- Performance optimization
- User acceptance testing

## Future Enhancements

1. **Drag & Drop**: Reorder tasks within an action
2. **Bulk Operations**: Select multiple tasks for batch updates
3. **Task Templates**: Create reusable task templates
4. **Task Dependencies**: Define dependencies between tasks
5. **Notifications**: Alert users about overdue tasks
6. **Collaboration**: Real-time updates for multi-user scenarios
7. **Task History**: Track all changes to tasks
8. **Advanced Filters**: Filter by multiple criteria simultaneously
9. **Task Attachments**: Attach files to tasks
10. **Recurring Tasks**: Support for recurring task patterns
