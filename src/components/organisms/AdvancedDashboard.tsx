import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Users, Calendar, AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';
import { ActionItem } from '@/data/actionData';
import { parse, differenceInDays, format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatusChart from '@/components/organisms/StatusChart';
import { CHART_COLORS, getSectorColor } from '@/utils/chartColors';

interface AdvancedDashboardProps {
  data: ActionItem[];
}

// Tipo para os top performers calculados nas métricas
type TopPerformer = {
  name: string;
  completionRate: number;
  total: number;
  completed: number;
  overdue: number;
};

const AdvancedDashboard = ({ data }: AdvancedDashboardProps) => {
  const metrics = useMemo(() => {
    const today = new Date();
    const totalActions = data.length;
    const completedActions = data.filter(action => action.delayStatus === 'Concluído').length;
    const overdueActions = data.filter(action => action.delayStatus === 'Em Atraso').length;
    const onTimeActions = data.filter(action => action.delayStatus === 'No Prazo').length;

    const completionRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

    const dueSoonActions = data.filter(action => {
      if (action.delayStatus === 'Concluído') return false;
      try {
        const dueDate = parse(action.dueDate, 'dd/MM/yyyy', new Date());
        const daysUntilDue = differenceInDays(dueDate, today);
        return daysUntilDue >= 0 && daysUntilDue <= 7;
      } catch {
        return false;
      }
    }).length;

    const responsibleStats = data.reduce((acc, action) => {
      if (!acc[action.responsible]) {
        acc[action.responsible] = { total: 0, completed: 0, overdue: 0 };
      }
      acc[action.responsible].total++;
      if (action.delayStatus === 'Concluído') acc[action.responsible].completed++;
      if (action.delayStatus === 'Em Atraso') acc[action.responsible].overdue++;
      return acc;
    }, {} as Record<string, { total: number; completed: number; overdue: number }>);

    const topPerformers = Object.entries(responsibleStats || {})
      .map(([name, stats]) => ({
        name,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
        total: stats.total,
        completed: stats.completed,
        overdue: stats.overdue
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);

    const sectorStats = data.reduce((acc, action) => {
      if (!acc[action.sector]) {
        acc[action.sector] = { total: 0, completed: 0, overdue: 0 };
      }
      acc[action.sector].total++;
      if (action.delayStatus === 'Concluído') acc[action.sector].completed++;
      if (action.delayStatus === 'Em Atraso') acc[action.sector].overdue++;
      return acc;
    }, {} as Record<string, { total: number; completed: number; overdue: number }>);

    const last6Months = eachMonthOfInterval({
      start: subMonths(today, 5),
      end: today
    });

    const monthlyTrend = last6Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthActions = data.filter(action => {
        try {
          const dueDate = parse(action.dueDate, 'dd/MM/yyyy', new Date());
          return dueDate >= monthStart && dueDate <= monthEnd;
        } catch {
          return false;
        }
      });

      const completed = monthActions.filter(a => a.delayStatus === 'Concluído').length;
      const total = monthActions.length;

      return {
        month: format(month, 'MMM/yy', { locale: ptBR }),
        total,
        completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0
      };
    });

    // KPIs adicionais
    const openActions = totalActions - completedActions;

    return {
      totalActions,
      completedActions,
      overdueActions,
      onTimeActions,
      completionRate,
      dueSoonActions,
      topPerformers,
      responsibleStats,
      sectorStats,
      monthlyTrend,
      openActions,
    };
  }, [data]);

  // Usando o sistema de cores consistente
  const COLORS = CHART_COLORS.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Visão Executiva</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Resumo estratégico das ações e performance</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Espaço reservado para ExportButton e outros atalhos */}
        </div>
      </div>

      {/* KPIs Cards (5) - Melhor responsividade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Taxa de Conclusão */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 truncate">Taxa de Conclusão</p>
                <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">{metrics.completionRate.toFixed(1)}%</p>
                <p className="text-xs text-green-600 dark:text-green-400 truncate">{metrics.completedActions} de {metrics.totalActions} ações</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Em Atraso */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 truncate">Em Atraso</p>
                <p className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300">{metrics.overdueActions}</p>
                <p className="text-xs text-red-600 dark:text-red-400 truncate">{((metrics.overdueActions / metrics.totalActions) * 100).toFixed(1)}% do total</p>
              </div>
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* No Prazo */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 truncate">No Prazo</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{metrics.onTimeActions}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{((metrics.onTimeActions / metrics.totalActions) * 100).toFixed(1)}% do total</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Vence em 7 dias */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400 truncate">Vence em 7 dias</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300">{metrics.dueSoonActions}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 truncate">Requer atenção</p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>



        {/* Ações Abertas */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">Ações Abertas</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300">{metrics.totalActions - metrics.completedActions}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Em andamento</p>
              </div>
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout Principal dos Gráficos - Melhor hierarquia visual */}
      <div className="space-y-6">
        {/* Primeira linha: Status (principal) + Tendência */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Status das Ações */}
          <div className="xl:col-span-1">
            <StatusChart />
          </div>
          
          {/* Tendência Mensal - Expandida */}
          <Card className="xl:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                Tendência Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 14 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      tick={{ fontSize: 14 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={{ stroke: '#cbd5e1' }}
                      label={{ value: 'Quantidade de Ações', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 14 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={{ stroke: '#cbd5e1' }}
                      label={{ value: 'Taxa de Conclusão (%)', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'completionRate' ? `${(value as number).toFixed(1)}%` : value,
                        name === 'completionRate' ? 'Taxa de Conclusão' : 
                        name === 'completed' ? 'Concluídas' : 'Total'
                      ]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke={CHART_COLORS.status.completed} 
                      strokeWidth={4}
                      dot={{ fill: CHART_COLORS.status.completed, strokeWidth: 3, r: 6 }}
                      activeDot={{ r: 8, stroke: CHART_COLORS.status.completed, strokeWidth: 3 }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="total" 
                      stroke={CHART_COLORS.status.onTime} 
                      strokeWidth={3}
                      strokeDasharray="8 4"
                      dot={{ fill: CHART_COLORS.status.onTime, strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: CHART_COLORS.status.onTime, strokeWidth: 2 }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="completed" 
                      stroke={CHART_COLORS.status.completed} 
                      strokeWidth={3}
                      dot={{ fill: CHART_COLORS.status.completed, strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: CHART_COLORS.status.completed, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda linha: Evolução por Responsável */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Users className="w-5 h-5 mr-2 brand-primary" />
              Evolução por Responsável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.responsibleStats || {})
                .sort(([,a], [,b]) => {
                  const completionRateA = a.total > 0 ? (a.completed / a.total) * 100 : 0;
                  const completionRateB = b.total > 0 ? (b.completed / b.total) * 100 : 0;
                  return completionRateA - completionRateB; // Ordenação crescente por porcentagem de conclusão
                })
                .map(([responsible, stats]: [string, { total: number; completed: number; overdue: number }]) => {
                  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                  const hasOverdue = stats.overdue > 0;
                  
                  return (
                    <div key={responsible} className="relative">
                      {/* Indicador visual para responsáveis com ações em atraso */}
                      {hasOverdue && (
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-red-500 rounded-full" />
                      )}
                      
                      <div className={`p-4 rounded-lg border transition-all ${
                        hasOverdue 
                          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 shadow-md' 
                          : 'border surface-container hover:surface-variant'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-primary">
                              {responsible.length > 25 ? responsible.substring(0, 25) + '...' : responsible}
                            </h4>
                            {hasOverdue && (
                              <div className="flex items-center space-x-1">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <Badge variant="destructive" className="text-xs">
                                  {stats.overdue} em atraso
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-primary">
                              {stats.completed}/{stats.total} ações
                            </div>
                            <div className={`text-xs ${
                              completionRate >= 80 ? 'text-green-600 dark:text-green-400' :
                              completionRate >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {completionRate.toFixed(1)}% concluído
                            </div>
                          </div>
                        </div>
                        
                        {/* Barra de progresso */}
                        <div className="space-y-2">
                          <Progress 
                            value={completionRate} 
                            className={`h-2 ${
                              hasOverdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'
                            }`}
                          />
                          
                          {/* Detalhamento das ações */}
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <div className="flex space-x-4">
                              <span className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-1" />
                                {stats.completed} concluídas
                              </span>
                              <span className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-1" />
                                {stats.total - stats.completed - stats.overdue} no prazo
                              </span>
                              {stats.overdue > 0 && (
                                <span className="flex items-center">
                                  <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mr-1" />
                                  {stats.overdue} em atraso
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdvancedDashboard;