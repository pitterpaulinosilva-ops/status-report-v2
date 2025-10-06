import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Building2 } from 'lucide-react';
import { actionData } from '@/data/actionData';
import { getSectorColor } from '@/utils/chartColors';

const SectorChart = () => {
  // Usando o sistema de cores consistente

  // Calculate statistics by sector
  const statsBySector = actionData.reduce((acc, item) => {
    const sector = item.sector;
    if (!acc[sector]) {
      acc[sector] = 0;
    }
    acc[sector]++;
    return acc;
  }, {} as Record<string, number>);

  // Prepare base data and compute Top 5 + Outros
  const chartData = Object.keys(statsBySector)
    .sort((a, b) => statsBySector[b] - statsBySector[a])
    .map((sector) => ({
      name: sector,
      value: statsBySector[sector],
      color: getSectorColor(sector)
    }));

  const top5 = chartData.slice(0, 5);
  const othersTotal = chartData.slice(5).reduce((sum, item) => sum + item.value, 0);
  const displayData = othersTotal > 0 
    ? [...top5, { name: 'Outros', value: othersTotal, color: '#94A3B8' }]
    : top5;

  // Sem labels percentuais para foco em contagem

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center text-xl text-slate-800 dark:text-slate-200">
          <Building2 className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
          Distribuição de Ações por Setor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Horizontal Bar Chart: Top 5 + Outros */}
          <div className="h-64 sm:h-72 lg:h-80 w-full" role="img" aria-label="Gráfico de barras mostrando a distribuição de ações por setor">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120} 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Ações']}
                  labelStyle={{ color: '#1e293b' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px'
                  }}
                />
                <Bar 
                   dataKey="value" 
                   radius={[6, 6, 6, 6]}
                   animationBegin={0}
                   animationDuration={800}
                   animationEasing="ease-out"
                 >
                   {displayData.map((entry, index) => (
                     <Cell 
                       key={`cell-${index}`} 
                       fill={entry.color}
                       stroke="#ffffff"
                       strokeWidth={1}
                     />
                   ))}
                 </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
              Total de Ações por Setor
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {displayData.map((sector, index) => (
                <div 
                  key={sector.name} 
                  className="flex justify-between items-center bg-slate-50 dark:bg-slate-700 p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center font-medium text-slate-700 dark:text-slate-300">
                    <span 
                      className="w-4 h-4 rounded-full mr-3 flex-shrink-0" 
                      style={{ backgroundColor: sector.color }}
                    />
                    <span className="truncate">{sector.name}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold ml-2"
                  >
                    {sector.value}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Geral:</span>
                <Badge className="bg-green-600 dark:bg-green-600 text-white text-lg px-3 py-1">
                  {actionData.length} Ações
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorChart;