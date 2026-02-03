
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { askCommunityAssistant } from '../services/gemini';
import { Person, Ministry, Transaction, Category } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface Props {
  people: Person[];
  ministries: Ministry[];
  transactions: Transaction[];
  categories: Category[];
}

const AssistantView: React.FC<Props> = ({ people, ministries, transactions, categories }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: '¡Hola! Soy tu asistente de ComunidadPro. Puedo ayudarte a encontrar información sobre miembros, ministerios o finanzas. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await askCommunityAssistant(input, {
      people,
      ministries,
      transactions,
      categories
    });

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: response || 'No pude procesar la respuesta.',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const suggestions = [
    "¿Cuántas personas hay en total?",
    "¿Quiénes están en el ministerio de Alabanza?",
    "Resumen de ingresos de este mes",
    "¿Cuál es el saldo total actual?",
    "Lista de adultos bautizados"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Asistente de Comunidad</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Potenciado por IA Gemini</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          SISTEMA ONLINE
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant' ? 'bg-indigo-600' : 'bg-slate-100'
            }`}>
              {msg.role === 'assistant' ? <Bot className="text-white w-5 h-5" /> : <UserIcon className="text-slate-500 w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`p-4 rounded-3xl inline-block text-sm leading-relaxed ${
                msg.role === 'assistant' 
                ? 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100' 
                : 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100'
              }`}>
                {msg.text}
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Loader2 className="text-indigo-400 w-5 h-5 animate-spin" />
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl rounded-tl-none border border-slate-100 text-sm text-slate-400">
              Analizando base de datos...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {suggestions.map(s => (
              <button 
                key={s}
                onClick={() => setInput(s)}
                className="text-xs font-bold bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-4 py-2 rounded-xl border border-slate-100 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            placeholder="Pregunta algo sobre tu comunidad..."
            className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-medium text-slate-800"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Los datos son procesados de forma privada para fines administrativos
        </p>
      </div>
    </div>
  );
};

export default AssistantView;
