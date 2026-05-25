import React, { useState, useEffect, useRef } from 'react';
import { Send, BrainCircuit, Loader2, User, Settings, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { functions } from '../../api/firebase';
import { httpsCallable } from 'firebase/functions';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const Conselheiro: React.FC = () => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou o seu Conselheiro Akumol. Tenho acesso aos seus dados financeiros em tempo real. Como posso ajudar hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempKey.trim()) return;
    localStorage.setItem('akumol_gemini_key', tempKey.trim());
    setShowSettings(false);
    setTempKey('');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    const userMsg: Message = { role: 'user', content: message };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setMessage('');
    setIsLoading(true);

    try {
      const askCounselor = httpsCallable(functions, 'askCounselor');
      const result = await askCounselor({
        messages: updated.map(msg => ({ role: msg.role, content: msg.content })),
        userFinancials: {
          saldo: user.financialData?.balance || 0,
          investido: user.financialData?.totalInvested || 0,
          horasSalvas: user.financialData?.hoursSaved || 0,
        }
      });

      const data = result.data as { reply: string };
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: unknown) {
      console.error('Counselor error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Tive um problema técnico. Tente novamente em alguns instantes.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col -mx-4 lg:-mx-8 -mt-2 lg:-mt-4" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="text-white" size={18} />
          </div>
          <div>
            <h1 className="font-black text-base text-slate-800 dark:text-white leading-none">Conselheiro IA</h1>
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Gemini Ativo
            </span>
          </div>
        </div>
        <div className="p-2.5 text-transparent select-none">
          &nbsp;
        </div>
      </div>

      {/* MENSAGENS */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-2xl mx-auto w-full space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 items-end ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-slate-700 dark:bg-slate-600'
                  : 'bg-indigo-600'
              }`}>
                {msg.role === 'user'
                  ? <User size={14} className="text-white" />
                  : <BrainCircuit size={14} className="text-white" />
                }
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-br-sm'
                  : 'bg-indigo-600 text-white rounded-bl-sm'
              }`}>
                {i === 0 && msg.role === 'assistant' && (
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1.5 text-indigo-200">
                    Conselheiro Akumol
                  </p>
                )}
                {i > 0 && msg.role === 'assistant' && (
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1.5 text-indigo-200">
                    Análise
                  </p>
                )}
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-end">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                <BrainCircuit size={14} className="text-white" />
              </div>
              <div className="bg-indigo-600 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-white" />
                <span className="text-xs font-bold text-white">Analisando...</span>
              </div>
            </div>
          )}
          <div className="h-2" />
        </div>
      </div>

      {/* INPUT */}
      <div className="shrink-0 p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 flex items-end gap-2">
            <textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Fale com o Conselheiro..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-white placeholder:text-slate-400 resize-none max-h-28 py-1"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 p-3.5 rounded-xl text-white shadow-lg shadow-indigo-500/20 active:scale-90 transition-all shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-400 mt-2 uppercase tracking-widest hidden md:block">
          Acesso em tempo real ao seu saldo e investimentos
        </p>
      </div>

      {/* MODAL API KEY */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Settings size={20} className="text-indigo-600" /> Chave Gemini
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  API Key (Google AI Studio)
                </label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Gere gratuitamente em <strong>aistudio.google.com</strong>. Salva localmente no seu navegador.
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm"
              >
                Salvar Chave
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conselheiro;
