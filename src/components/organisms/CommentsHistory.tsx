import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, History, Send, User, Clock, Edit3 } from 'lucide-react';
import { ActionItem } from '@/data/actionData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { setSecureItem, getSecureItem, removeSecureItem } from '@/lib/encryption';

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

interface CommentsHistoryProps {
  actionItem: ActionItem;
  onUpdate?: (actionId: string, updates: Partial<ActionItem>) => void;
}

const CommentsHistory: React.FC<CommentsHistoryProps> = ({ actionItem, onUpdate }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser] = useState('Usuário Atual'); // In a real app, this would come from auth
  const [isOpen, setIsOpen] = useState(false);

  // Load comments from localStorage with encryption on component mount
  useEffect(() => {
    const commentsKey = `comments_${actionItem.id}`;
    
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
  }, [actionItem.id]);

  // Save comments to localStorage with encryption whenever comments change
  useEffect(() => {
    if (comments.length > 0) {
      const commentsKey = `comments_${actionItem.id}`;
      try {
        setSecureItem(commentsKey, comments);
      } catch (error) {
        console.error('Erro ao salvar comentários criptografados:', error);
        // Fallback para salvamento não criptografado em caso de erro
        localStorage.setItem(commentsKey, JSON.stringify(comments));
      }
    }
  }, [comments, actionItem.id]);

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      actionId: actionItem.id,
      author: currentUser,
      content: newComment.trim(),
      timestamp: new Date(),
      type: 'comment'
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const addHistoryEntry = (type: Comment['type'], oldValue?: string, newValue?: string) => {
    const historyEntry: Comment = {
      id: Date.now().toString(),
      actionId: actionItem.id,
      author: currentUser,
      content: getHistoryMessage(type, oldValue, newValue),
      timestamp: new Date(),
      type,
      oldValue,
      newValue
    };

    setComments(prev => [historyEntry, ...prev]);
  };

  const getHistoryMessage = (type: Comment['type'], oldValue?: string, newValue?: string): string => {
    switch (type) {
      case 'status_change':
        return `Status alterado de "${oldValue}" para "${newValue}"`;
      case 'assignment_change':
        return `Responsável alterado de "${oldValue}" para "${newValue}"`;
      case 'due_date_change':
        return `Data de vencimento alterada de "${oldValue}" para "${newValue}"`;
      default:
        return '';
    }
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
          variant="outline"
          size="sm"
          className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:bg-white/90 dark:hover:bg-slate-700/90"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Comentários
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
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentários e Histórico
            <Badge variant="outline" className="ml-2">
              {actionItem.action.length > 50 ? `${actionItem.action.substring(0, 50)}...` : actionItem.action}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
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
      </DialogContent>
    </Dialog>
  );
};

export default CommentsHistory;