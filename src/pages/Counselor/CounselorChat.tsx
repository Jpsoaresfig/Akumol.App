import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Mic, 
  Video, 
  Send, 
  BrainCircuit, 
  Paperclip,
  ChevronLeft,
  Settings,
  X,
  Loader2,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const Conselheiro: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- ESTADOS ---
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou o seu Conselheiro Akumol alimentado pelo Gemini. Como posso ajudar nas suas finanças hoje?' }
  ]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Agora salvamos a chave do Gemini no LocalStorage
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey);
    setShowSettings(false);
  };

  // --- CHAMADA PARA A API DO GOOGLE GEMINI ---
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    if (!apiKey) {
      alert("Por favor, configure sua Chave de API do Gemini clicando no ícone de engrenagem no topo.");
      setShowSettings(true);
      return;
    }

    const newUserMessage: Message = { role: 'user', content: message };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setMessage('');
    setIsLoading(true);

    const saldo = user?.financialData?.balance || 0;
    const investido = user?.financialData?.totalInvested || 0;
    const horasSalvas = user?.financialData?.hoursSaved || 0;
    const plano = user?.plan || 'basic';

    // Instrução oculta de sistema para o Gemini
    const systemInstruction = `Você é o Conselheiro Akumol, um assistente financeiro de elite extremamente inteligente, direto e analítico. 
    Os dados financeiros atuais do usuário são: 
    - Saldo na conta: R$ ${saldo.toFixed(2)}
    - Total Investido: R$ ${investido.toFixed(2)}
    - Horas de Vida Salvas (Herança): ${horasSalvas} horas
    - Plano de Assinatura: ${plano.toUpperCase()}
    
    Regras:
    1. Use esses dados para aconselhar o usuário de forma precisa.
    2. Se ele quiser comprar algo, calcule se ele pode pagar e qual o impacto no patrimônio dele.
    3. Seja firme, mas educado. Evite que ele gaste dinheiro à toa.
    4. Responda de forma limpa, com parágrafos curtos ou bullet points.`;

    // A API do Gemini exige o formato: { role: 'user' | 'model', parts: [{ text: '...' }] }
    // Ignoramos a primeira mensagem de boas-vindas do app para não confundir o histórico inicial da API
    const geminiHistory = newMessages.slice(1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    try {
      // Endpoint oficial do Gemini 1.5 Flash (Rápido e excelente para chat)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: geminiHistory,
          generationConfig: {
            temperature: 0.7,
          }
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      // Extrai a resposta do JSON do Gemini
      const aiResponseText = data.candidates[0].content.parts[0].text;

      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponseText }]);

    } catch (error: any) {
      console.error("Erro na API do Gemini:", error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: `❌ Ocorreu um erro ao falar com o Gemini: ${error.message}` 
      }]);
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
    <div className="flex flex-col h-dvh bg-[#F8FAFC] dark:bg-slate-950 transition-colors overflow-hidden relative">
      
      {/* HEADER */}
      <header className="flex-none p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="lg:hidden p-2 -ml-2 text-slate-500">
            <ChevronLeft size={24} />
          </button>
          
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg md:text-xl text-slate-800 dark:text-white leading-none">Conselheiro</h1>
            <span className="text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
              IA Gemini Ativa
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* BOTÃO DE CONFIGURAÇÕES (API KEY) */}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all active:scale-95"
          >
            <Settings size={20} />
          </button>

          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
            <Video size={18} />
            <span className="hidden sm:inline">Vídeo Chamada</span>
          </button>
        </div>
      </header>

      {/* ÁREA DE MENSAGENS */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <BrainCircuit size={16} />}
              </div>

              <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border max-w-[85%] md:max-w-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-tr-none' 
                  : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 rounded-tl-none'
              }`}>
                {msg.role === 'assistant' && index > 0 && (
                  <h4 className="font-black text-indigo-600 dark:text-indigo-400 text-[9px] uppercase mb-2 tracking-tighter">
                    Análise Akumol
                  </h4>
                )}
                <div className="text-slate-700 dark:text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-start max-w-[90%] md:max-w-2xl">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1">
                <BrainCircuit size={16} className="text-white" />
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl rounded-tl-none border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-2 text-indigo-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs font-bold animate-pulse">A consultar o Gemini...</span>
              </div>
            </div>
          )}

          <div className="h-4" />
        </div>
      </main>

      {/* INPUT MENSAGEM */}
      <footer className="flex-none p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3">
          <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl md:rounded-3xl p-1.5 flex items-end gap-1">
            <button className="p-2.5 md:p-3 text-slate-400 hover:text-indigo-600 rounded-full transition-colors hidden sm:block">
              <Camera size={20} />
            </button>
            <button className="p-2.5 md:p-3 text-slate-400 hover:text-indigo-600 rounded-full transition-colors hidden sm:block">
              <Paperclip size={20} />
            </button>
            
            <textarea 
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Fale com o Gemini sobre seu dinheiro..."
              className="flex-1 bg-transparent border-none outline-none py-3 px-3 text-xs md:text-sm text-slate-700 dark:text-white placeholder:text-slate-400 resize-none max-h-32"
              disabled={isLoading}
            />
            
            <button 
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={() => setIsRecording(false)}
              className={`p-2.5 md:p-3 rounded-full transition-all ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600'
              }`}
            >
              <Mic size={20} />
            </button>
          </div>

          <button 
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-indigo-600 disabled:bg-slate-300 disabled:dark:bg-slate-800 p-3.5 md:p-4 rounded-xl md:rounded-full text-white shadow-lg active:scale-90 transition-all shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
        
        <p className="hidden md:block text-[9px] text-center text-slate-400 mt-4 uppercase font-bold tracking-widest">
          O Conselheiro IA possui acesso aos seus dados de saldo e investimento em tempo real
        </p>
      </footer>

      {/* --- MODAL PARA INSERIR CHAVE DA API --- */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Settings size={24} className="text-indigo-600" /> API Gemini
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Chave de API (Google AI Studio)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-2">
                  Você pode gerar sua chave gratuitamente acessando o Google AI Studio. Ela ficará salva localmente no seu navegador.
                </p>
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-sm">
                Salvar Chave Gemini
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Conselheiro;