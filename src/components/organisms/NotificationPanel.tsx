import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionItem } from '@/data/actionData';
import { parse, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';

interface NotificationPanelProps {
  data: ActionItem[];
}

interface NotificationItem {
  id: number;
  action: string;
  responsible: string;
  dueDate: string;
  daysUntilDue: number;
  priority: 'high' | 'medium' | 'low';
  type: 'overdue' | 'due-soon' | 'due-today' | 'comment';
  commentDetails?: { author: string; text: string; timestamp: string };
}

const NotificationPanel = ({ data }: NotificationPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    const generateNotifications = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const notificationItems: NotificationItem[] = [];
      
      data.forEach(action => {
        if (action.status !== 'Concluído' && action.delayStatus !== 'Concluído') {
          try {
            const dueDate = parse(action.dueDate, 'dd/MM/yyyy', new Date());
            dueDate.setHours(0, 0, 0, 0);
            
            const daysUntilDue = differenceInDays(dueDate, today);
            
            let shouldNotify = false;
            let type: 'overdue' | 'due-soon' | 'due-today' = 'due-soon';
            let priority: 'high' | 'medium' | 'low' = 'low';
            
            if (isAfter(today, dueDate)) {
              shouldNotify = true;
              type = 'overdue';
              priority = 'high';
            } else if (daysUntilDue === 0) {
              shouldNotify = true;
              type = 'due-today';
              priority = 'high';
            } else if (daysUntilDue <= 7 && daysUntilDue > 0) {
              shouldNotify = true;
              type = 'due-soon';
              priority = daysUntilDue <= 3 ? 'high' : 'medium';
            }
            
            if (shouldNotify && !dismissedNotifications.has(`action-${action.id}`)) {
              notificationItems.push({
                id: action.id,
                action: action.action,
                responsible: action.responsible,
                dueDate: action.dueDate,
                daysUntilDue,
                priority,
                type
              });
            }
          } catch (error) {
            console.warn('Erro ao processar data da ação:', action.id, error);
          }
        }

        action.comments?.forEach((comment, index) => {
          const commentId = `comment-${action.id}-${index}`;
          if (!dismissedNotifications.has(commentId)) {
            notificationItems.push({
              id: action.id,
              action: action.action,
              responsible: action.responsible,
              dueDate: action.dueDate,
              daysUntilDue: 0, // Not applicable for comments
              priority: 'medium', // Or any other logic
              type: 'comment',
              commentDetails: comment,
            });
          }
        });
      });
      
      notificationItems.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        if (a.type === 'comment' && b.type !== 'comment') return 1; 
        if (a.type !== 'comment' && b.type === 'comment') return -1;
        return a.daysUntilDue - b.daysUntilDue;
      });
      
      setNotifications(notificationItems);
    };
    
    generateNotifications();
    
    const interval = setInterval(generateNotifications, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [data, dismissedNotifications]);

  const dismissNotification = (id: string) => {
    setDismissedNotifications(prev => new Set([...prev, id]));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'due-today':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'due-soon':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationMessage = (notification: NotificationItem) => {
    if (notification.type === 'overdue') {
      const daysOverdue = Math.abs(notification.daysUntilDue);
      return `Em atraso há ${daysOverdue} dia${daysOverdue !== 1 ? 's' : ''}`;
    } else if (notification.type === 'due-today') {
      return 'Vence hoje';
    } else {
      return `Vence em ${notification.daysUntilDue} dia${notification.daysUntilDue !== 1 ? 's' : ''}`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative bg-white/70 dark:bg-slate-700/70 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 backdrop-blur-sm ${
          notifications.length > 0 ? 'animate-pulse' : ''
        }`}
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {notifications.length > 99 ? '99+' : notifications.length}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-600" />
                  Notificações
                  {highPriorityCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {highPriorityCount} urgente{highPriorityCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação no momento</p>
                  <p className="text-sm mt-1">Todas as ações estão em dia!</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getNotificationIcon(notification.type)}
                            <Badge className={getPriorityColor(notification.priority)}>
                              {getNotificationMessage(notification)}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 line-clamp-2">
                            {notification.action.length > 80 
                              ? notification.action.substring(0, 80) + '...' 
                              : notification.action
                            }
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span>ID: {notification.id}</span>
                            <span>{notification.responsible}</span>
                            <span>Prazo: {notification.dueDate}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissNotification(notification.id)}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;