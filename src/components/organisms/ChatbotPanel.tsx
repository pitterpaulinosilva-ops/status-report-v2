import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Sparkles, Clock, AlertTriangle, CheckCircle2, User, Lightbulb, ExternalLink, Zap, MessageCircle, Brain, Monitor } from 'lucide-react';
import { ActionItem } from '@/data/actionData';
import { chatInputSchema, validateAndSanitizeInput } from '@/lib/validation';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatbotPanelProps {
  data: ActionItem[];
  openModal: (assistant: 'gemini' | 'copilot') => void;
}

const ChatbotPanel: React.FC<ChatbotPanelProps> = ({ data, openModal }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const stats = useMemo(() => {
    const total = data.length;
    const atrasadas = data.filter(d => d.delayStatus === 'Em Atraso').length;
    const noPrazo = data.filter(d => d.delayStatus === 'No Prazo').length;
    const concluidas = data.filter(d => d.delayStatus === 'Concluído').length;
    return { total, atrasadas, noPrazo, concluidas };
  }, [data]);

  useEffect(() => {
    // Mensagem inicial do assistente
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        timestamp: Date.now(),
        content:
          'Olá! Sou seu assistente de IA. Posso ajudar a: 1) listar ações atrasadas, 2) priorizar o que vence esta semana, 3) sugerir próximos passos para uma ação específica, 4) gerar mensagens para engajar responsáveis. O que você precisa agora?'
      }
    ]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickAsk = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(text), 0);
  };

  const formatList = (items: string[]) => items.map((i, idx) => `${idx + 1}. ${i}`).join('\n');

  const getDueInDays = (dateStr?: string | Date) => {
    if (!dateStr) return undefined;
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const today = new Date();
    const diff = Math.ceil((d.getTime() - new Date(today.toDateString()).getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const suggestionsForAction = (id: number) => {
    const action = data.find(a => a.id === id);
    if (!action) return `Não encontrei a ação #${id}. Verifique o código.`;

    const dueIn = getDueInDays(action.dueDate);
    const risk = action.delayStatus === 'Em Atraso' || (dueIn !== undefined && dueIn <= 3);

    const steps = [
      `Revisar escopo e critérios de aceite com o responsável (${action.responsible}).`,
      `Definir entregável mínimo e etapa imediatamente executável hoje no setor ${action.sector}.`,
      `Remover bloqueios: listar dependências, pedir apoio a quem decide (gestão/setor).`,
      `Agendar checkpoint rápido (15 min) em 48h para validar avanço.`,
      `Registrar atualização no EPA com evidências (prints, documentos, registros).`
    ];

    const riskNote = risk
      ? `Atenção: esta ação está em risco (${action.delayStatus}${dueIn !== undefined ? `, vence em ${dueIn} dia(s)` : ''}). Priorize!`
      : `Status atual: ${action.delayStatus}${dueIn !== undefined ? `, vence em ${dueIn} dia(s)` : ''}.`;

    return [
      `Ação #${action.id}: ${action.action}`,
      riskNote,
      '',
      'Próximos passos sugeridos:',
      formatList(steps),
      '',
      `Mensagem sugerida para o responsável (${action.responsible}):`,
      `"Olá ${action.responsible}, tudo bem? Sobre a ação #${action.id} (${action.action}), vamos focar no entregável mínimo hoje e alinhar um checkpoint em 48h? Posso ajudar a remover bloqueios. Obrigado!"`
    ].join('\n');
  };

  const buildResponse = (text: string): string => {
    const q = text.toLowerCase();

    if (q.includes('atrasad')) {
      const atrasadas = data.filter(d => d.delayStatus === 'Em Atraso');
      if (atrasadas.length === 0) return 'Ótimo! Não há ações atrasadas no momento.';
      const lines = atrasadas.slice(0, 10).map(a => `#${a.id} • ${a.action} • Resp.: ${a.responsible} • Setor: ${a.sector}`);
      const more = atrasadas.length > 10 ? `\n... e mais ${atrasadas.length - 10} ação(ões).` : '';
      return ['Ações atrasadas prioritárias:', formatList(lines), more].filter(Boolean).join('\n');
    }

    if (q.includes('semana') || q.includes('vence') || q.includes('prazo')) {
      const week = data.filter(d => {
        const days = getDueInDays(d.dueDate);
        return typeof days === 'number' && days >= 0 && days <= 7 && d.delayStatus !== 'Concluído';
      });
      if (week.length === 0) return 'Nenhuma ação vence nos próximos 7 dias.';
      const lines = week.slice(0, 10).map(a => `#${a.id} • ${a.action} • em ${getDueInDays(a.dueDate)} dia(s)`);
      return ['Ações que vencem esta semana:', formatList(lines)].join('\n');
    }

    if (q.match(/#\d+/)) {
      const id = Number((q.match(/#\d+/) || [''])[0].replace('#', ''));
      if (!isNaN(id)) return suggestionsForAction(id);
    }

    if (q.includes('respons')) {
      const byResp: Record<string, number> = {};
      data.forEach(a => (byResp[a.responsible] = (byResp[a.responsible] || 0) + 1));
      const top = Object.entries(byResp || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([r, c]) => `${r}: ${c} ação(ões)`);
      return ['Distribuição por responsável (top 5):', formatList(top)].join('\n');
    }

    if (q.includes('setor') || q.includes('area')) {
      const bySector: Record<string, number> = {};
      data.forEach(a => (bySector[a.sector] = (bySector[a.sector] || 0) + 1));
      const top = Object.entries(bySector || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([s, c]) => `${s}: ${c} ação(ões)`);
      return ['Concentração por setor (top 5):', formatList(top)].join('\n');
    }

    // Resposta padrão
    return [
      'Posso ajudar com:',
      '1) Liste ações atrasadas ("listar ações atrasadas")',
      '2) O que vence esta semana ("o que vence esta semana?")',
      '3) Sugestões para a ação #ID ("sugira próximos passos para a ação #101")',
      '4) Resumo por responsável ou setor',
      'Dica: use #ID para uma recomendação específica.'
    ].join('\n');
  };

  const handleSend = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text) return;

    try {
      // Validar e sanitizar entrada
      const validatedText = validateAndSanitizeInput(text, chatInputSchema);
      
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: validatedText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      // Simula processamento de IA local
      setTimeout(() => {
        const answer = buildResponse(validatedText);
        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: answer,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, aiMsg]);
        setLoading(false);
      }, 1000 + Math.random() * 1500);
    } catch (error) {
      // Tratar erro de validação
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Erro: ${error instanceof Error ? error.message : 'Entrada inválida'}. Por favor, tente novamente com uma mensagem válida.`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMsg]);
      setLoading(false);
    }
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">


      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.role === 'assistant' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-slate-700 dark:bg-slate-600'
                }`}>
                  {m.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 ${m.role === 'user' ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                      {m.role === 'assistant' ? 'Assistente' : 'Você'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTime(m.timestamp)}
                    </span>
                  </div>
                  <div className={`prose prose-sm max-w-none ${
                    m.role === 'assistant' 
                      ? 'text-slate-700 dark:text-slate-300' 
                      : 'bg-blue-600 text-white rounded-2xl px-4 py-3 inline-block'
                  }`}>
                    <pre className="whitespace-pre-wrap font-sans leading-relaxed m-0">{m.content}</pre>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm text-slate-900 dark:text-slate-100">Assistente</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                    <span className="text-sm">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>



        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Digite sua pergunta sobre as ações... (Ex: Sugira próximos passos para a ação #101)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="min-h-[44px] resize-none border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <Button 
                onClick={() => handleSend()} 
                disabled={loading || input.trim().length === 0}
                size="icon"
                className="h-[44px] w-[44px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <Lightbulb className="w-3 h-3" />
              <span>Use #ID para recomendações específicas (ex: #101) • Total de {stats.total} ações no sistema</span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ChatbotPanel;