import { useState, useEffect } from 'react';
import { BellDot, X, AlertTriangle, Clock3, CalendarCheck2, AlertCircle, TrendingDown, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionItem } from '@/data/actionData';
import { parse, differenceInDays, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  data: ActionItem[];
}

interface NotificationItem {
  id: number;
  action: string;
  responsible: string;
  dueDate: string;
  daysUntilDue: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'overdue' | 'due-soon' | 'due-today' | 'comment' | 'critical-delay';
  commentDetails?: { author: string; text: string; timestamp: string };
  delayStatus?: string;
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
            let type: 'overdue' | 'due-soon' | 'due-today' | 'critical-delay' = 'due-soon';
            let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
            
            // Atraso crítico (mais de 30 dias)
            if (isAfter(today, dueDate) && Math.abs(daysUntilDue) > 30) {
              shouldNotify = true;
              type = 'critical-delay';
              priority = 'critical';
            }
            // Atraso severo (15-30 dias)
            else if (isAfter(today, dueDate) && Math.abs(daysUntilDue) > 15) {
              shouldNotify = true;
              type = 'overdue';
              priority = 'critical';
            }
            // Atraso (qualquer dia)
            else if (isAfter(today, dueDate)) {
              shouldNotify = true;
              type = 'overdue';
              priority = 'high';
            }
            // Vence hoje
            else if (daysUntilDue === 0) {
              shouldNotify = true;
              type = 'due-today';
              priority = 'high';
            }
            // Vence em breve (1-7 dias)
            else if (daysUntilDue <= 7 && daysUntilDue > 0) {
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
                type,
                delayStatus: action.delayStatus
              });
            }
          } catch (error) {
            console.warn('Erro ao processar data da ação:', action.id, error);
          }
        }
      });
      
      notificationItems.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
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
      case 'critical-delay':
        return <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'due-today':
        return <CalendarCheck2 className="w-4 h-4 text-orange-500" />;
      case 'due-soon':
        return <Clock3 className="w-4 h-4 text-yellow-500" />;
      default:
        return <BellDot className="w-4 h-4" />;
    }
  };

  const getNotificationMessage = (notification: NotificationItem) => {
    if (notification.type === 'critical-delay') {
      const daysOverdue = Math.abs(notification.daysUntilDue);
      return `🚨 CRÍTICO: ${daysOverdue} dias de atraso`;
    } else if (notification.type === 'overdue') {
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
      case 'critical':
        return 'bg-red-600 text-white dark:bg-red-700 dark:text-white font-bold animate-pulse';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const criticalCount = notifications.filter(n => n.priority === 'critical').length;
  const overdueCount = notifications.filter(n => n.type === 'overdue' || n.type === 'critical-delay').length;

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
        <BellDot className="w-5 h-5" />
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
            <CardHeader className="pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BellDot className="w-5 h-5 text-blue-600" />
                  Alertas e Notificações
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
              
              {/* Estatísticas de Alertas */}
              {notifications.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {criticalCount > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="text-xs font-semibold text-red-900 dark:text-red-100">Críticos</p>
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">{criticalCount}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {overdueCount > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-2 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <div>
                          <p className="text-xs font-semibold text-orange-900 dark:text-orange-100">Atrasados</p>
                          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{overdueCount}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1.5">
                      <BellDot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">Total</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{notifications.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <BellDot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação no momento</p>
                  <p className="text-sm mt-1">Todas as ações estão em dia!</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors",
                        notification.priority === 'critical' && "bg-red-50/50 dark:bg-red-950/20 border-l-4 border-l-red-600"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {getNotificationIcon(notification.type)}
                            <Badge className={getPriorityColor(notification.priority)}>
                              {getNotificationMessage(notification)}
                            </Badge>
                            {notification.delayStatus && notification.delayStatus !== 'No Prazo' && (
                              <Badge variant="outline" className="text-xs border-red-300 text-red-700 dark:border-red-700 dark:text-red-300">
                                Status: {notification.delayStatus}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                            {notification.action.length > 80 
                              ? notification.action.substring(0, 80) + '...' 
                              : notification.action
                            }
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">ID: {notification.id}</span>
                            <span className="flex items-center gap-1">
                              <Users2 className="w-3 h-3" />
                              {notification.responsible}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarCheck2 className="w-3 h-3" />
                              {notification.dueDate}
                            </span>
                          </div>
                          
                          {/* Alerta adicional para atrasos críticos */}
                          {notification.priority === 'critical' && (
                            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-800">
                              <p className="text-xs font-semibold text-red-800 dark:text-red-200 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Ação requer atenção imediata!
                              </p>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissNotification(`action-${notification.id}`)}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100 flex-shrink-0"
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