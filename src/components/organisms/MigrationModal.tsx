/**
 * MigrationModal Component
 * Modal for migrating data from localStorage to Supabase
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Upload,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  detectLocalStorageData, 
  migrateToSupabase, 
  type MigrationProgress,
  type MigrationResult 
} from '@/utils/migrateToSupabase';

export const MigrationModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [hasData, setHasData] = useState(false);
  const [dataInfo, setDataInfo] = useState({ actionsCount: 0, tasksCount: 0 });

  // Detect localStorage data on mount
  useEffect(() => {
    if (!user) return;

    const detection = detectLocalStorageData();
    setHasData(detection.hasActions || detection.hasTask);
    setDataInfo({
      actionsCount: detection.actionsCount,
      tasksCount: detection.tasksCount
    });

    // Check if user already skipped migration
    const migrationSkipped = localStorage.getItem('migration_skipped');
    
    // Auto-open modal if there's data to migrate AND user hasn't skipped
    if ((detection.hasActions || detection.hasTask) && !migrationSkipped) {
      setIsOpen(true);
    }
  }, [user]);

  const handleMigrate = async () => {
    if (!user) return;

    setIsMigrating(true);
    setResult(null);

    try {
      const migrationResult = await migrateToSupabase(user.id, (progressUpdate) => {
        setProgress(progressUpdate);
      });

      setResult(migrationResult);
    } catch (error) {
      setResult({
        success: false,
        actionsCount: 0,
        tasksCount: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
        message: 'Falha na migração'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    // Marcar que o usuário pulou a migração (pode usar localStorage)
    localStorage.setItem('migration_skipped', 'true');
  };

  const handleClearLocalData = () => {
    if (confirm('Tem certeza que deseja limpar os dados locais? Esta ação não pode ser desfeita.')) {
      try {
        localStorage.removeItem('actions');
        localStorage.removeItem('actions_encrypted');
        localStorage.removeItem('tasks');
        localStorage.removeItem('tasks_encrypted');
        localStorage.setItem('migration_skipped', 'true');
        setIsOpen(false);
        window.location.reload();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  };

  const handleClose = () => {
    if (!isMigrating) {
      setIsOpen(false);
    }
  };

  if (!hasData || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Migração de Dados
              </DialogTitle>
              <DialogDescription>
                Detectamos dados locais que podem ser migrados
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Data Info */}
          {!result && !isMigrating && (
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Dados encontrados:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {dataInfo.actionsCount > 0 && (
                      <li>{dataInfo.actionsCount} {dataInfo.actionsCount === 1 ? 'ação' : 'ações'}</li>
                    )}
                    {dataInfo.tasksCount > 0 && (
                      <li>{dataInfo.tasksCount} {dataInfo.tasksCount === 1 ? 'tarefa' : 'tarefas'}</li>
                    )}
                  </ul>
                  <p className="text-sm mt-2">
                    Migrar seus dados para o Supabase permitirá sincronização entre dispositivos e backup automático.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Migration Progress */}
          {isMigrating && progress && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium">{progress.message}</span>
              </div>
              <Progress value={progress.progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {progress.progress}% concluído
              </p>
            </div>
          )}

          {/* Migration Result */}
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{result.message}</p>
                  {result.errors.length > 0 && (
                    <div className="text-sm space-y-1">
                      <p className="font-medium">Erros:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.errors.slice(0, 3).map((error, index) => (
                          <li key={index} className="text-xs">{error}</li>
                        ))}
                        {result.errors.length > 3 && (
                          <li className="text-xs">... e mais {result.errors.length - 3} erros</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!result && !isMigrating && (
              <>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1"
                >
                  Pular
                </Button>
                <Button
                  onClick={handleMigrate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Migrar Agora
                </Button>
              </>
            )}

            {result && (
              <>
                {!result.success && (
                  <Button
                    onClick={handleClearLocalData}
                    variant="destructive"
                    className="flex-1"
                  >
                    Limpar Dados Locais
                  </Button>
                )}
                <Button
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                  variant={result.success ? 'default' : 'outline'}
                >
                  {result.success ? 'Concluir' : 'Fechar'}
                </Button>
              </>
            )}
          </div>

          {/* Warning */}
          {!result && !isMigrating && (
            <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
                Após a migração bem-sucedida, os dados locais serão removidos. Certifique-se de estar conectado à internet.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
