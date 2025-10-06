import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Brain, 
  Send, 
  User, 
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Settings,
  Maximize2,
  Minimize2,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  assistant: 'gemini' | 'copilot';
  isTyping?: boolean;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAssistant?: 'gemini' | 'copilot';
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ 
  isOpen, 
  onClose, 
  initialAssistant = 'gemini' 
}) => {
  const [activeTab, setActiveTab] = useState(initialAssistant);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const assistants = {
    gemini: {
      name: 'Dicas de Uso - Gemini',
      icon: Sparkles,
      color: 'blue',
      description: 'Especializado em análise de dados ONA e insights estratégicos',
      capabilities: [
        'Análise de dados ONA',
        'Geração de insights estratégicos',
        'Relatórios personalizados',
        'Visualização de dados'
      ],
      usageTips: [
        'Compare o desempenho entre os setores: `qual setor tem mais ações atrasadas e por quê?`',
        'Identifique a causa raiz de um problema: `analise as ações do responsável X e identifique os principais gargalos`.',
        'Peça previsões e tendências: `com base nos dados atuais, qual a previsão de conclusão para o projeto Y?`',
        'Solicite um resumo executivo: `crie um resumo dos principais riscos e pontos de atenção no plano de ação atual`.',
      ],
      welcomeMessage: '🤖 **Gemini - Especialista em Análise ONA**\n\nOlá! Sou seu assistente especializado em análise de dados ONA e insights estratégicos. Estou aqui para ajudá-lo a:\n\n• Analisar dados de performance\n• Gerar insights estratégicos\n• Criar relatórios personalizados\n• Visualizar tendências e padrões\n\n**💡 Dica**: Seja específico sobre o que você quer analisar para obter melhores resultados!',
      placeholder: 'Ex: "Analise as ações em atraso por setor nos últimos 3 meses"'
    },
    copilot: {
      name: 'Dicas de Uso - Copilot',
      icon: Brain,
      color: 'green',
      description: 'Integração com Microsoft 365 e produtividade empresarial',
      capabilities: [
        'Integração M365',
        'Automação de processos',
        'Análise de documentos',
        'Colaboração em equipe'
      ],
      usageTips: [
        '📝 **Documentação eficiente**: Use para criar templates e padronizar documentos',
        '📧 **Comunicação otimizada**: Gere emails profissionais e relatórios estruturados',
        '📊 **Excel avançado**: Automatize cálculos e crie dashboards interativos',
        '🤝 **Colaboração Teams**: Organize reuniões e acompanhe ações definidas',
        '⚡ **Automação Power Platform**: Crie fluxos para processos repetitivos'
      ],
      welcomeMessage: '🤖 **Copilot - Especialista em Produtividade M365**\n\nOlá! Sou seu assistente integrado ao Microsoft 365. Estou aqui para otimizar sua produtividade através de:\n\n• Automação de processos\n• Integração com ferramentas M365\n• Análise de documentos\n• Colaboração em equipe\n\n**🚀 Dica**: Aproveite a integração nativa com Word, Excel, Teams e SharePoint!',
      placeholder: 'Ex: "Como automatizar relatórios semanais no Power Automate?"'
    }
  };

  const activeAssistant = assistants[activeTab];

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages on component mount
  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);

  // Inicializar conversa com mensagem de boas-vindas
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        content: activeAssistant.welcomeMessage,
        sender: 'assistant',
        timestamp: new Date(),
        assistant: activeTab
      };
      const initialMessages = [welcomeMessage];
      setMessages(initialMessages);
      saveMessages(initialMessages);
    }
  }, [isOpen, activeTab, activeAssistant.welcomeMessage, messages.length]);

  // Load messages from localStorage
  const loadMessages = () => {
    try {
      const saved = localStorage.getItem('ai-assistant-messages');
      if (saved) {
        const parsedMessages = JSON.parse(saved).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Save messages to localStorage
  const saveMessages = (messages: Message[]) => {
    try {
      localStorage.setItem('ai-assistant-messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  // Simular resposta do assistente
  const simulateAssistantResponseText = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (activeTab === 'gemini') {
      // Respostas específicas do Gemini para ONA
      if (lowerMessage.includes('ona') || lowerMessage.includes('análise')) {
        return "Como especialista em ONA (Organizational Network Analysis), posso ajudá-lo a analisar padrões de comunicação, identificar influenciadores-chave e mapear redes organizacionais. Que tipo de análise você gostaria de realizar?";
      } else if (lowerMessage.includes('dados') || lowerMessage.includes('relatório')) {
        return "Posso ajudá-lo a interpretar dados organizacionais, criar visualizações de rede e gerar insights sobre colaboração. Você tem algum conjunto de dados específico que gostaria de analisar?";
      } else if (lowerMessage.includes('rede') || lowerMessage.includes('conexão')) {
        return "Excelente! A análise de redes organizacionais pode revelar padrões ocultos de comunicação, identificar silos e oportunidades de melhoria na colaboração. Posso ajudá-lo a mapear essas conexões.";
      } else if (lowerMessage.includes('insight') || lowerMessage.includes('tendência')) {
        return "Com base nos dados de ONA, posso identificar tendências de comunicação, padrões de liderança informal e oportunidades de otimização organizacional. Que insights específicos você busca?";
      } else {
        return "Como assistente especializado em ONA, estou aqui para ajudá-lo com análises organizacionais, mapeamento de redes, identificação de influenciadores e otimização de processos colaborativos. Como posso ajudá-lo hoje?";
      }
    } else {
      // Respostas específicas do Copilot para M365
      if (lowerMessage.includes('m365') || lowerMessage.includes('microsoft') || lowerMessage.includes('office')) {
        return "Como assistente integrado ao Microsoft 365, posso ajudá-lo com Teams, SharePoint, Outlook, Power BI e outras ferramentas da suíte. Que tarefa você gostaria de realizar?";
      } else if (lowerMessage.includes('teams') || lowerMessage.includes('reunião')) {
        return "Posso ajudá-lo a otimizar o uso do Microsoft Teams, agendar reuniões, gerenciar canais e melhorar a colaboração da equipe. Precisa de ajuda com alguma funcionalidade específica?";
      } else if (lowerMessage.includes('sharepoint') || lowerMessage.includes('documento')) {
        return "No SharePoint, posso ajudá-lo a organizar documentos, criar sites de equipe, configurar fluxos de trabalho e melhorar o compartilhamento de informações. O que você precisa fazer?";
      } else if (lowerMessage.includes('power bi') || lowerMessage.includes('dashboard')) {
        return "Com Power BI, posso ajudá-lo a criar dashboards interativos, analisar dados organizacionais e gerar relatórios visuais. Você tem dados específicos que gostaria de visualizar?";
      } else if (lowerMessage.includes('outlook') || lowerMessage.includes('email')) {
        return "Posso ajudá-lo a otimizar o Outlook, organizar emails, configurar regras automáticas e melhorar sua produtividade na comunicação. Que funcionalidade você gostaria de explorar?";
      } else {
        return "Como assistente Microsoft 365, posso ajudá-lo com Teams, SharePoint, Outlook, Power BI, Word, Excel e outras ferramentas da suíte. Estou aqui para otimizar sua produtividade e colaboração. Como posso ajudá-lo?";
      }
    }
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      assistant: activeTab
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    // Simular delay de resposta
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: simulateAssistantResponseText(inputMessage),
        sender: 'assistant',
        timestamp: new Date(),
        assistant: activeTab
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  // Limpar conversa
  const clearChat = () => {
    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      content: activeAssistant.welcomeMessage,
      sender: 'assistant',
      timestamp: new Date(),
      assistant: activeTab
    };
    const resetMessages = [welcomeMessage];
    setMessages(resetMessages);
    saveMessages(resetMessages);
  };

  // Copiar mensagem
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Alternar fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'w-[98vw] h-[95vh] max-w-none' : 'w-[95vw] h-[90vh] max-w-4xl'} p-0 overflow-hidden transition-all duration-300`}>
        <DialogHeader className="p-4 pb-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${activeAssistant.color === 'blue' ? 'from-blue-600 to-blue-700' : 'from-green-600 to-green-700'} flex items-center justify-center`}>
                <activeAssistant.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {activeAssistant.name}
                </DialogTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {activeAssistant.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-3 pt-2">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="gemini" className="flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dicas de Uso - </span>Gemini
                <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                  ONA
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="copilot" className="flex items-center gap-1.5 text-xs">
                <Brain className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dicas de Uso - </span>Copilot
                <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                  M365
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Capabilities Bar */}
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap gap-1.5">
                {activeAssistant.capabilities.map((capability, index) => (
                  <Badge key={index} variant="outline" className="text-[10px] px-2 py-0.5">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                  {/* Dicas de Uso - Exibidas quando não há mensagens */}
                  {messages.filter(msg => msg.assistant === activeTab).length === 0 && (
                    <div className="space-y-4">
                      {/* Welcome Message */}
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {activeAssistant.welcomeMessage}
                        </p>
                      </div>

                      {/* Usage Tips */}
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2 text-sm">
                          <Lightbulb className="w-4 h-4" />
                          Dicas de Uso
                        </h4>
                        <ul className="space-y-1">
                          {activeAssistant.usageTips?.map((tip, index) => (
                            <li key={index} className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                              • {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  )}

                  {messages
                    .filter(msg => msg.assistant === activeTab)
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.sender === 'assistant' && (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${activeAssistant.color === 'blue' ? 'from-blue-600 to-blue-700' : 'from-green-600 to-green-700'} flex items-center justify-center flex-shrink-0`}>
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                          <div
                            className={`rounded-lg p-3 ${
                              message.sender === 'user'
                                ? `bg-${activeAssistant.color}-600 text-white`
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-500">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {message.sender === 'assistant' && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyMessage(message.content)}
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {message.sender === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${activeAssistant.color === 'blue' ? 'from-blue-600 to-blue-700' : 'from-green-600 to-green-700'} flex items-center justify-center flex-shrink-0`}>
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={activeAssistant.placeholder}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className={`${activeAssistant.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
};

  export default AIAssistantModal;