/**
 * TaskModal Component
 * Modal for creating and editing tasks
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, TaskFormData } from '@/types/task';
import { useTaskCRUD } from '@/hooks/useTaskCRUD';
import { TASK_STATUSES } from '@/constants/taskConstants';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentActionId: number;
  task?: Task; // If editing
}

export const TaskModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  parentActionId, 
  task 
}: TaskModalProps) => {
  const { createTask, updateTask, isSubmitting, error, validationErrors, clearError } = useTaskCRUD();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    responsible: '',
    sector: '',
    dueDate: '',
    status: 'Planejado'
  });
  
  // Load task data when editing
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
    } else {
      // Reset form when creating new task
      setFormData({
        title: '',
        description: '',
        responsible: '',
        sector: '',
        dueDate: '',
        status: 'Planejado'
      });
    }
    clearError();
  }, [task, isOpen, clearError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      if (task) {
        await updateTask(task.id, formData);
      } else {
        await createTask(formData, parentActionId);
      }
      onSuccess();
      onClose();
    } catch (err) {
      // Error is handled by the hook
      console.error('Error saving task:', err);
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
          <DialogDescription>
            {task 
              ? 'Atualize as informações da tarefa abaixo.' 
              : 'Preencha os campos abaixo para criar uma nova tarefa.'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="required">
              Título da Tarefa *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Revisar protocolo de segurança"
              required
              disabled={isSubmitting}
              className={validationErrors.title ? 'border-red-500' : ''}
            />
            {validationErrors.title && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {validationErrors.title}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os detalhes da tarefa..."
              rows={3}
              disabled={isSubmitting}
              className={validationErrors.description ? 'border-red-500' : ''}
            />
            {validationErrors.description && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {validationErrors.description}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formData.description.length}/1000 caracteres
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsible" className="required">
                Responsável *
              </Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Ex: maria.silva"
                required
                disabled={isSubmitting}
                className={validationErrors.responsible ? 'border-red-500' : ''}
              />
              {validationErrors.responsible && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.responsible}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="sector" className="required">
                Setor *
              </Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="Ex: Segurança e Saúde"
                required
                disabled={isSubmitting}
                className={validationErrors.sector ? 'border-red-500' : ''}
              />
              {validationErrors.sector && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.sector}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate" className="required">
                Data de Vencimento *
              </Label>
              <Input
                id="dueDate"
                type="text"
                placeholder="DD/MM/AAAA"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
                disabled={isSubmitting}
                className={validationErrors.dueDate ? 'border-red-500' : ''}
              />
              {validationErrors.dueDate && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.dueDate}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Formato: DD/MM/AAAA
              </p>
            </div>
            
            <div>
              <Label htmlFor="status" className="required">
                Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
                disabled={isSubmitting}
              >
                <SelectTrigger id="status" className={validationErrors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.status && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.status}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                task ? 'Atualizar' : 'Criar Tarefa'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
