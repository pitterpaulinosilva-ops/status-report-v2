/**
 * ActionModal Component
 * Modal for creating and editing actions
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionItem } from '@/data/actionData';
import { useActionCRUD, ActionFormData } from '@/hooks/useActionCRUD';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  action?: ActionItem;
}

const ACTION_STATUSES = ['Planejado', 'Em Andamento', 'Concluído'];

export const ActionModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  action 
}: ActionModalProps) => {
  const { createAction, updateAction, isSubmitting, error, clearError } = useActionCRUD();
  
  const [formData, setFormData] = useState<ActionFormData>({
    action: '',
    followUp: '',
    responsible: '',
    sector: '',
    dueDate: '',
    status: 'Planejado'
  });
  
  useEffect(() => {
    if (action) {
      setFormData({
        action: action.action,
        followUp: action.followUp,
        responsible: action.responsible,
        sector: action.sector,
        dueDate: action.dueDate,
        status: action.status
      });
    } else {
      setFormData({
        action: '',
        followUp: '',
        responsible: '',
        sector: '',
        dueDate: '',
        status: 'Planejado'
      });
    }
    clearError();
  }, [action, isOpen, clearError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      if (action) {
        await updateAction(action.id, formData);
      } else {
        await createAction(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving action:', err);
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {action ? 'Editar Ação' : 'Nova Ação'}
          </DialogTitle>
          <DialogDescription>
            {action 
              ? 'Atualize as informações da ação abaixo.' 
              : 'Preencha os campos abaixo para criar uma nova ação.'}
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
            <Label htmlFor="action-title">
              Título da Ação *
            </Label>
            <Input
              id="action-title"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              placeholder="Ex: Implementar sistema de gerenciamento"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="followUp">
              Descrição / Acompanhamento *
            </Label>
            <Textarea
              id="followUp"
              value={formData.followUp}
              onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
              placeholder="Descreva os detalhes e objetivos da ação..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsible">
                Responsável *
              </Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Ex: maria.silva"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="sector">
                Setor *
              </Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="Ex: Segurança e Saúde"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">
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
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Formato: DD/MM/AAAA
              </p>
            </div>
            
            <div>
              <Label htmlFor="status">
                Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                action ? 'Atualizar Ação' : 'Criar Ação'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
