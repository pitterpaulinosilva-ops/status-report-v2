import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useProcessedActionData } from '@/hooks/useProcessedActionData';
import { CHART_COLORS, getStatusColor } from '@/utils/chartColors';

const StatusChart = () => {
  const processedActionData = useProcessedActionData();

  // Usando o sistema de cores consistente
  const STATUS_COLORS = CHART_COLORS.status;

  // Calculate statistics by delay status - usando os dados processados diretamente
  const statsByStatus = processedActionData.reduce((acc, item) => {
    const status = item.delayStatus; // Usar o delayStatus já processado
    
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status]++;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for pie chart - only include statuses that have actions
  const chartData = Object.entries(statsByStatus || {})
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: getStatusColor(status)
    }))
    .sort((a, b) => b.value - a.value); // Sort by count descending

  const total = processedActionData.length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Em Atraso':
        return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'No Prazo':
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'Concluído':
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  return (
    <Card className="professional-card animate-fade-in hover-lift">
      <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
        <CardTitle className="flex items-center typography-heading-2 text-primary">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 brand-primary" />
          Status das Ações
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
          {/* Donut Chart - Mobile Optimized */}
          <div className="h-56 sm:h-64 lg:h-72 xl:h-80 w-full" role="img" aria-label="Gráfico de pizza mostrando a distribuição de status das ações">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  innerRadius="60%"
                  fill="#8884d8"
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="hsl(var(--background))"
                      strokeWidth={1}
                    />
                  ))}
                  {/* Total central */}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        const { cx, cy } = viewBox as { cx: number; cy: number };
                        return (
                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan fill="hsl(var(--text-primary))" fontSize="20" fontWeight="700">{total}</tspan>
                            <tspan x={cx} dy="18" fill="hsl(var(--text-secondary))" fontSize="12">Ações</tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Ações']}
                  labelStyle={{ color: 'hsl(var(--text-primary))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--surface-elevated))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    boxShadow: 'var(--shadow-md)',
                    color: 'hsl(var(--text-primary))',
                    fontSize: '14px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary List - Mobile Optimized */}
          <div className="w-full">
            <h3 className="typography-heading-3 font-semibold mb-2 sm:mb-3 lg:mb-4 text-primary">
              Resumo por Status
            </h3>
            <div className="space-y-1.5 sm:space-y-2 lg:space-y-3" role="list" aria-label="Lista de status das ações">
              {chartData.map((status) => (
                <div 
                  key={status.name} 
                  className="flex justify-between items-center surface-container p-2.5 sm:p-3 lg:p-4 rounded-lg hover:surface-variant transition-smooth hover-lift"
                  role="listitem"
                  aria-label={`${status.name}: ${status.value} ações`}
                >
                  <div className="flex items-center font-medium text-secondary typography-body-md min-w-0 flex-1">
                    <span 
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full mr-2 sm:mr-3 flex-shrink-0" 
                      style={{ backgroundColor: status.color }}
                      aria-hidden="true"
                    />
                    <div className="flex items-center min-w-0 flex-1">
                      {getStatusIcon(status.name)}
                      <span className="ml-1 sm:ml-2 truncate typography-body-md">{status.name}</span>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="surface-variant text-primary font-semibold ml-2 typography-caption flex-shrink-0"
                    aria-label={`${status.value} ações`}
                  >
                    {status.value}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-3 sm:mt-4 lg:mt-6 p-2.5 sm:p-3 lg:p-4 surface-variant rounded-lg border border-brand-primary/30 transition-smooth" role="region" aria-label="Total geral de ações">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-secondary typography-body-md">Total Geral:</span>
                <Badge className="bg-brand-primary text-white typography-body-md px-2 sm:px-3 py-1 transition-smooth" aria-label={`Total de ${total} ações`}>
                  {total} Ações
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusChart;