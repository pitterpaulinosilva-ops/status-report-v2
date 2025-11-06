import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Users2, CalendarCheck2, AlertTriangle, CheckCircle2, Clock3, ListChecks } from 'lucide-react';
import { ActionItem } from '@/data/actionData';
import { TaskStorage } from '@/lib/taskStorage';
import { calculateDelayStatus } from '@/lib/utils';
import { parse, differenceInDays, format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatusChart from '@/components/organisms/StatusChart';
import { CHART_COLORS } from '@/utils/chartColors';

interface AdvancedDashboardProps {
  data: ActionItem[];
}

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

    // Estatísticas de tarefas
    const allTasks = TaskStorage.getTasks();
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'Concluído').length;
    const overdueTasks = allTasks.filter(t => calculateDelayStatus(t.dueDate, t.status) === 'Em Atraso').length;
    const onTimeTasks = allTasks.filter(t => calculateDelayStatus(t.dueDate, t.status) === 'No Prazo').length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Taxa de conclusão combinada (ações + tarefas)
    const totalItems = totalActions + totalTasks;
    const completedItems = completedActions + completedTasks;
    const overallCompletionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

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
      // Task metrics
      totalTasks,
      completedTasks,
      overdueTasks,
      onTimeTasks,
      taskCompletionRate,
      overallCompletionRate,
      totalItems,
      completedItems
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header Card com Gradiente SESI/SENAI */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#164194]/5 to-[#52AE32]/5 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8 transition-all duration-500">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#164194]/10 to-[#52AE32]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#52AE32]/10 to-[#E84910]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-sesi-text mb-2">Visão Executiva</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Resumo estratégico das ações e performance do projeto</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Espaço reservado para ExportButton e outros atalhos */}
          </div>
        </div>
      </div>

      {/* KPIs Cards (6) - Ordem: Taxa Geral > Ações Abertas > Tarefas > No Prazo > Vence em 7 dias > Em Atraso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Taxa Geral - Verde SESI */}
        <Card className="bg-gradient-to-br from-[#52AE32]/10 to-[#52AE32]/20 dark:from-[#52AE32]/20 dark:to-[#52AE32]/10 border-2 border-[#52AE32]/30 dark:border-[#52AE32]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#52AE32] dark:text-[#7bc95e] truncate">Taxa Geral</p>
                <p className="text-xl sm:text-2xl font-bold text-[#52AE32] dark:text-[#7bc95e]">{metrics.overallCompletionRate.toFixed(1)}%</p>
                <p className="text-xs text-[#52AE32]/70 dark:text-[#7bc95e]/70 truncate">{metrics.completedItems} de {metrics.totalItems}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#52AE32] dark:text-[#7bc95e] flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* 2. Ações Abertas - Azul SESI/SENAI */}
        <Card className="bg-gradient-to-br from-[#164194]/10 to-[#164194]/20 dark:from-[#164194]/20 dark:to-[#164194]/10 border-2 border-[#164194]/30 dark:border-[#164194]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#164194] dark:text-[#4a7bc8] truncate">Ações Abertas</p>
                <p className="text-xl sm:text-2xl font-bold text-[#164194] dark:text-[#4a7bc8]">{metrics.totalActions - metrics.completedActions}</p>
                <p className="text-xs text-[#164194]/70 dark:text-[#4a7bc8]/70 truncate">Em andamento</p>
              </div>
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-[#164194] dark:text-[#4a7bc8] flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* 3. Tarefas - Laranja SENAI */}
        <Card className="bg-gradient-to-br from-[#E84910]/10 to-[#E84910]/20 dark:from-[#E84910]/20 dark:to-[#E84910]/10 border-2 border-[#E84910]/30 dark:border-[#E84910]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#E84910] dark:text-[#ff7a4d] truncate">Tarefas</p>
                <p className="text-xl sm:text-2xl font-bold text-[#E84910] dark:text-[#ff7a4d]">{metrics.totalTasks}</p>
                <p className="text-xs text-[#E84910]/70 dark:text-[#ff7a4d]/70 truncate">{metrics.taskCompletionRate.toFixed(1)}% concluídas</p>
              </div>
              <ListChecks className="w-6 h-6 sm:w-8 sm:h-8 text-[#E84910] dark:text-[#ff7a4d] flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* 4. No Prazo - Azul SESI/SENAI */}
        <Card className="bg-gradient-to-br from-[#164194]/10 to-[#164194]/20 dark:from-[#164194]/20 dark:to-[#164194]/10 border-2 border-[#164194]/30 dark:border-[#164194]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#164194] dark:text-[#4a7bc8] truncate">No Prazo</p>
                <p className="text-xl sm:text-2xl font-bold text-[#164194] dark:text-[#4a7bc8]">{metrics.onTimeActions}</p>
                <p className="text-xs text-[#164194]/70 dark:text-[#4a7bc8]/70 truncate">{((metrics.onTimeActions / metrics.totalActions) * 100).toFixed(1)}% do total</p>
              </div>
              <Clock3 className="w-6 h-6 sm:w-8 sm:h-8 text-[#164194] dark:text-[#4a7bc8] flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* 5. Vence em 7 dias */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400 truncate">Vence em 7 dias</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300">{metrics.dueSoonActions}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 truncate">Requer atenção</p>
              </div>
              <CalendarCheck2 className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* 6. Em Atraso */}
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

        {/* Segunda linha: Evolução por Responsável - Design Melhorado */}
        <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-700">
          <CardHeader className="bg-gradient-to-r from-[#164194]/5 to-[#52AE32]/5 dark:from-[#164194]/10 dark:to-[#52AE32]/10 border-b-2 border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl font-bold gradient-sesi-text">
                <Users2 className="w-6 h-6 mr-3 text-[#164194]" />
                Evolução por Responsável
              </CardTitle>
              <Badge variant="outline" className="text-xs font-semibold">
                {Object.keys(metrics.responsibleStats || {}).length} responsáveis
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Acompanhe o desempenho individual de cada responsável
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.entries(metrics.responsibleStats || {})
                .sort(([,a], [,b]) => {
                  // Ordenar por taxa de conclusão (crescente - menor primeiro) e depois por total de ações
                  const completionRateA = a.total > 0 ? (a.completed / a.total) * 100 : 0;
                  const completionRateB = b.total > 0 ? (b.completed / b.total) * 100 : 0;
                  if (completionRateA !== completionRateB) {
                    return completionRateA - completionRateB; // Menor taxa primeiro
                  }
                  return b.total - a.total; // Mais ações primeiro em caso de empate
                })
                .map(([responsible, stats]: [string, { total: number; completed: number; overdue: number }], index) => {
                  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                  const hasOverdue = stats.overdue > 0;
                  const inProgress = stats.total - stats.completed - stats.overdue;
                  
                  // Determinar cor do card baseado na performance
                  const getPerformanceColor = () => {
                    if (completionRate >= 80) return 'success';
                    if (completionRate >= 60) return 'warning';
                    if (hasOverdue) return 'danger';
                    return 'neutral';
                  };
                  
                  const performanceColor = getPerformanceColor();
                  
                  return (
                    <div 
                      key={responsible} 
                      className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        performanceColor === 'success' 
                          ? 'border-[#52AE32]/30 bg-gradient-to-r from-[#52AE32]/5 to-[#52AE32]/10 dark:from-[#52AE32]/10 dark:to-[#52AE32]/5 hover:border-[#52AE32]/50' 
                          : performanceColor === 'danger'
                          ? 'border-red-300/50 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 hover:border-red-400/70'
                          : performanceColor === 'warning'
                          ? 'border-yellow-300/50 bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 hover:border-yellow-400/70'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-[#164194]/50'
                      }`}
                    >
                      {/* Barra lateral colorida */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        performanceColor === 'success' ? 'bg-[#52AE32]' :
                        performanceColor === 'danger' ? 'bg-red-500' :
                        performanceColor === 'warning' ? 'bg-yellow-500' :
                        'bg-[#164194]'
                      }`} />
                      
                      <div className="p-5 pl-6">
                        {/* Header com nome e badges */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#164194] to-[#52AE32] flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {responsible.split('.').map(n => n[0]?.toUpperCase()).join('')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                                    {responsible}
                                  </h4>
                                  {/* Badge de Atenção inline para os 3 primeiros (menor taxa) */}
                                  {index < 3 && completionRate < 80 && (
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full shadow-md ${
                                      index === 0 ? 'bg-red-500 text-white' :
                                      index === 1 ? 'bg-orange-500 text-white' :
                                      'bg-yellow-500 text-white'
                                    }`}>
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {stats.total} {stats.total === 1 ? 'ação' : 'ações'} atribuídas
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Taxa de conclusão destacada */}
                          <div className="text-right flex-shrink-0">
                            <div className={`text-3xl font-bold ${
                              completionRate >= 80 ? 'text-[#52AE32]' :
                              completionRate >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {completionRate.toFixed(0)}%
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              concluído
                            </p>
                          </div>
                        </div>
                        
                        {/* Barra de progresso melhorada */}
                        <div className="space-y-3">
                          <div className="relative">
                            <Progress 
                              value={completionRate} 
                              className="h-3 bg-slate-200 dark:bg-slate-700"
                            />
                            {/* Indicador de meta (80%) */}
                            <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-slate-400 dark:bg-slate-500 opacity-50" />
                          </div>
                          
                          {/* Estatísticas detalhadas em cards */}
                          <div className="grid grid-cols-3 gap-2">
                            {/* Concluídas */}
                            <div className="bg-[#52AE32]/10 dark:bg-[#52AE32]/20 rounded-lg p-2.5 border border-[#52AE32]/20">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#52AE32]" />
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Concluídas</p>
                                  <p className="text-lg font-bold text-[#52AE32]">{stats.completed}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* No Prazo */}
                            <div className="bg-[#164194]/10 dark:bg-[#164194]/20 rounded-lg p-2.5 border border-[#164194]/20">
                              <div className="flex items-center gap-2">
                                <Clock3 className="w-4 h-4 text-[#164194]" />
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No Prazo</p>
                                  <p className="text-lg font-bold text-[#164194]">{inProgress}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Em Atraso */}
                            <div className={`rounded-lg p-2.5 border ${
                              hasOverdue 
                                ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700' 
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            }`}>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className={`w-4 h-4 ${hasOverdue ? 'text-red-600' : 'text-slate-400'}`} />
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Em Atraso</p>
                                  <p className={`text-lg font-bold ${hasOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                                    {stats.overdue}
                                  </p>
                                </div>
                              </div>
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