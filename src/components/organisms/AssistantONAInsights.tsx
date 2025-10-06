import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  ExternalLink, 
  Bot, 
  Lightbulb, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const AssistantONAInsights = () => {
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  const assistants = [
    {
      id: 'gemini',
      name: 'Gemini AI',
      description: 'Assistente avançado do Google para análise de dados e insights',
      url: 'https://gemini.google.com/gem/1ZiPvbSuE3Tzw3SBmm8MYzo5vwIp63uEK?usp=sharing',
      icon: '🤖',
      color: 'bg-blue-500',
      features: ['Análise de dados', 'Geração de relatórios', 'Insights estratégicos']
    },
    {
      id: 'copilot',
      name: 'Microsoft Copilot',
      description: 'Assistente inteligente da Microsoft para produtividade',
      url: 'https://m365.cloud.microsoft:443/chat/?titleId=T_df29d454-c320-94e1-cb7a-f6092227a223&source=embedded-builder',
      icon: '💼',
      color: 'bg-purple-500',
      features: ['Automação de tarefas', 'Análise de documentos', 'Suporte técnico']
    }
  ];

  const usabilityTips = {
    inProgress: [
      "Pergunte: 'Como posso acelerar as ações em andamento?'",
      "Solicite: 'Quais são os principais gargalos identificados?'",
      "Questione: 'Que recursos adicionais podem ajudar?'",
      "Explore: 'Como priorizar as ações mais críticas?'"
    ],
    delayed: [
      "Pergunte: 'Quais são as causas das ações em atraso?'",
      "Solicite: 'Como recuperar o cronograma perdido?'",
      "Questione: 'Que estratégias de mitigação posso usar?'",
      "Explore: 'Como prevenir futuros atrasos?'"
    ],
    general: [
      "Use dados específicos do seu dashboard para perguntas mais precisas",
      "Mencione setores e responsáveis específicos para análises direcionadas",
      "Solicite comparações entre períodos para identificar tendências",
      "Peça sugestões de melhorias baseadas nos dados atuais"
    ]
  };

  const handleAssistantClick = (assistant: any) => {
    setSelectedAssistant(assistant.id);
    setShowTips(true);
  };

  const openAssistant = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowTips(false);
    setSelectedAssistant(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Lightbulb className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Assistente ONA Insights
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Acesse assistentes de IA especializados para obter insights avançados sobre suas ações e melhorar a tomada de decisões.
        </p>
      </div>

      {/* Assistants Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {assistants.map((assistant) => (
          <Card key={assistant.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className={`w-12 h-12 ${assistant.color} rounded-full flex items-center justify-center text-white text-2xl`}>
                  {assistant.icon}
                </div>
                <CardTitle className="text-xl">{assistant.name}</CardTitle>
              </div>
              <CardDescription className="text-center">
                {assistant.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {assistant.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              
              {/* Botão principal - Abre diretamente o assistente */}
              <Button 
                className="w-full" 
                onClick={() => openAssistant(assistant.url)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir {assistant.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tips Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Dicas Rápidas de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-help">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Ações em Andamento</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Otimize o progresso</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Foque em acelerar processos e identificar gargalos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-help">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">Ações em Atraso</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Recupere o tempo</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Identifique causas e desenvolva estratégias de recuperação</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-help">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">Análise Geral</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Insights estratégicos</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Use dados específicos para análises mais precisas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantONAInsights;