import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Building2, 
  Calendar, 
  MessageSquare, 
  History, 
  Send, 
  Clock, 
  FileText,
  Eye
} from 'lucide-react';
import { ActionItem } from '@/data/actionData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { setSecureItem, getSecureItem } from '@/lib/encryption';

interface Comment {
  id: string;
  actionId: string;
  author: string;
  content: string;
  timestamp: Date;
  type: 'comment' | 'status_change' | 'assignment_change' | 'due_date_change';
  oldValue?: string;
  newValue?: string;
}

interface ActionDetailsModalProps {
  action: ActionItem;
  onUpdate?: (actionId: string, updates: Partial<ActionItem>) => void;
}

const ActionDetailsModal: React.FC<ActionDetailsModalProps> = ({ action, onUpdate }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser] = useState('Usuário Atual');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Load comments from localStorage with encryption on component mount
  useEffect(() => {
    const commentsKey = `comments_${action.id}`;
    
    // Tentar carregar comentários criptografados
    const decryptedComments = getSecureItem<Array<Omit<Comment, 'timestamp'> & { timestamp: string }>>(commentsKey);
    if (decryptedComments) {
      const parsed: Comment[] = decryptedComments.map((comment) => ({
        ...comment,
        timestamp: new Date(comment.timestamp)
      }));
      setComments(parsed);
      return;
    }
    
    // Fallback para comentários não criptografados (migração)
    const savedComments = localStorage.getItem(commentsKey);
    if (savedComments) {
      try {
        const parsedRaw = JSON.parse(savedComments) as Array<Omit<Comment, 'timestamp'> & { timestamp: string }>;
        const parsed: Comment[] = parsedRaw.map((comment) => ({
          ...comment,
          timestamp: new Date(comment.timestamp)
        }));
        setComments(parsed);
        
        // Migrar para formato criptografado
        setSecureItem(commentsKey, parsedRaw);
        localStorage.removeItem(commentsKey);
      } catch (error) {
        console.warn('Erro ao migrar comentários:', error);
        localStorage.removeItem(commentsKey);
      }
    }
  }, [action.id]);

  // Save comments to localStorage with encryption whenever comments change
  useEffect(() => {
    if (comments.length > 0) {
      const commentsKey = `comments_${action.id}`;
      try {
        setSecureItem(commentsKey, comments);
      } catch (error) {
        console.error('Erro ao salvar comentários criptografados:', error);
        localStorage.setItem(commentsKey, JSON.stringify(comments));
      }
    }
  }, [comments, action.id]);

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      actionId: action.id,
      author: currentUser,
      content: newComment.trim(),
      timestamp: new Date(),
      type: 'comment'
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const getCommentIcon = (type: Comment['type']) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'status_change':
      case 'assignment_change':
      case 'due_date_change':
        return <History className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCommentTypeColor = (type: Comment['type']) => {
    switch (type) {
      case 'comment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'status_change':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'assignment_change':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'due_date_change':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      addComment();
    }
  };

  const commentsCount = comments.filter(c => c.type === 'comment').length;
  const historyCount = comments.filter(c => c.type !== 'comment').length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="typography-body-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
          {comments.length > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {comments.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="typography-heading-2 font-bold text-gray-800 dark:text-gray-100">
            Ação - Cód: {action.id}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentários
              {comments.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {comments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-6">
              <div className="bg-gray-50/80 dark:bg-slate-700/30 p-6 rounded-lg">
                <h3 className="typography-heading-3 font-bold text-gray-800 dark:text-gray-100 mb-4">
                  {action.action}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 typography-body-sm">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500" />
                    <span className="typography-body-sm font-semibold text-gray-700 dark:text-gray-200">Responsável:</span>
                    <span className="ml-2 typography-body-sm text-gray-600 dark:text-gray-300">{action.responsible}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500" />
                    <span className="typography-body-sm font-semibold text-gray-700 dark:text-gray-200">Setor:</span>
                    <span className="ml-2 typography-body-sm text-gray-600 dark:text-gray-300">{action.sector}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500" />
                    <span className="typography-body-sm font-semibold text-gray-700 dark:text-gray-200">Prazo:</span>
                    <span className="ml-2 typography-body-sm text-gray-600 dark:text-gray-300">{action.dueDate}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`typography-caption font-semibold py-2 px-3 rounded-full ${
                      action.status === 'Concluído' 
                        ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 dark:from-indigo-900/30 dark:to-indigo-800/30 dark:text-indigo-300' 
                        : action.status === 'Planejado'
                        ? 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-300'
                    } shadow-sm`}>
                      Status: {action.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="typography-heading-3 font-bold text-gray-700 dark:text-gray-200 mb-3">Acompanhamento:</h4>
                <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200/50 dark:border-slate-600/50">
                  <p className="typography-body-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {action.followUp}
                  </p>
                </div>
              </div>

              {/* Seção de Comentários na aba de detalhes */}
              <div>
                <h4 className="typography-heading-3 font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comentários Recentes
                  {comments.length > 0 && (
                    <Badge variant="outline">
                      {commentsCount} comentários
                    </Badge>
                  )}
                </h4>
                
                {/* Add Comment */}
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {currentUser.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Adicione um comentário... (Ctrl+Enter para enviar)"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Pressione Ctrl+Enter para enviar
                          </span>
                          <Button
                            onClick={addComment}
                            disabled={!newComment.trim()}
                            size="sm"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Comentar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Comments Preview */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments.slice(0, 3).map((comment) => (
                    <Card key={comment.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {comment.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs">{comment.author}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(comment.timestamp, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {comments.length > 3 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('comments')}
                      className="w-full"
                    >
                      Ver todos os {comments.length} comentários
                    </Button>
                  )}
                  {comments.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum comentário ainda</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 flex flex-col overflow-hidden mt-4">
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Stats */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {commentsCount} comentários
                </span>
                <span className="flex items-center gap-1">
                  <History className="h-4 w-4" />
                  {historyCount} alterações
                </span>
              </div>

              {/* Add Comment */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {currentUser.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Adicione um comentário... (Ctrl+Enter para enviar)"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Pressione Ctrl+Enter para enviar
                        </span>
                        <Button
                          onClick={addComment}
                          disabled={!newComment.trim()}
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Comentar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments and History List */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum comentário ainda</p>
                    <p className="text-sm">Seja o primeiro a comentar nesta ação!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {comment.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getCommentTypeColor(comment.type)}`}
                              >
                                {getCommentIcon(comment.type)}
                                <span className="ml-1">
                                  {comment.type === 'comment' ? 'Comentário' : 'Alteração'}
                                </span>
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(comment.timestamp, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ActionDetailsModal;