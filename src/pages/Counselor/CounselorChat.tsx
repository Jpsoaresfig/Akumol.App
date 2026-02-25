import { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Mic, 
  Video, 
  Send, 
  BrainCircuit, 
  Paperclip,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Conselheiro = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem ao abrir ou receber nova resposta
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors overflow-hidden">
      
      {/* HEADER OTIMIZADO PARA MOBILE */}
      <header className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          {/* Botão Voltar visível apenas em mobile para facilitar a navegação rápida */}
          <button 
            onClick={() => navigate(-1)}
            className="lg:hidden p-2 -ml-2 text-slate-500"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg md:text-xl text-slate-800 dark:text-white leading-none">Conselheiro</h1>
            <span className="text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
              IA Ativa
            </span>
          </div>
        </div>
        
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
          <Video size={18} />
          <span className="hidden sm:inline">Vídeo Chamada</span>
        </button>
      </header>

      {/* ÁREA DE MENSAGENS RESPONSIVA */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth pb-10"
      >
        {/* Boas-vindas da IA */}
        <div className="max-w-full md:max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 md:p-6 rounded-2xl md:rounded-4xl shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
            Olá! Sou o seu Conselheiro Akumol. Como posso ajudar hoje? Pode enviar-me uma **foto**, um **áudio** ou iniciarmos uma **vídeo chamada** para analisar as suas compras em tempo real.
          </p>
        </div>
        
        {/* Exemplo de Resposta da IA (Balão) */}
        <div className="flex gap-3 items-start max-w-full md:max-w-2xl">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1">
             <BrainCircuit size={16} className="text-white" />
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 md:p-6 rounded-2xl rounded-tl-none border border-indigo-100 dark:border-indigo-500/20">
            <h4 className="font-black text-indigo-600 dark:text-indigo-400 text-[9px] uppercase mb-1.5 tracking-tighter">Análise Patrimonial</h4>
            <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-snug">
              Detetei que esta compra representa **12% da sua reserva de emergência**. Sugiro aguardar pela promoção da próxima semana.
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE INPUT MULTIMÉDIA - FIXA NO FUNDO */}
      <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3">
          <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl md:rounded-4xl p-1.5 flex items-end gap-0.5 md:gap-1">
            
            {/* Controlos Multimédia Otimizados para Toque */}
            <button className="p-2.5 md:p-3 text-slate-400 hover:text-indigo-600 active:bg-slate-200 dark:active:bg-slate-700 rounded-full transition-colors">
              <Camera size={20} />
            </button>
            <button className="p-2.5 md:p-3 text-slate-400 hover:text-indigo-600 active:bg-slate-200 dark:active:bg-slate-700 rounded-full transition-colors">
              <Paperclip size={20} />
            </button>
            
            <textarea 
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Fale com a IA..."
              className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-xs md:text-sm text-slate-700 dark:text-white placeholder:text-slate-400 resize-none max-h-32"
            />
            
            <button 
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={() => setIsRecording(false)}
              onTouchStart={() => setIsRecording(true)}
              onTouchEnd={() => setIsRecording(false)}
              className={`p-2.5 md:p-3 rounded-full transition-all ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600'
              }`}
            >
              <Mic size={20} />
            </button>
          </div>

          <button className="bg-indigo-600 p-3.5 md:p-4 rounded-xl md:rounded-full text-white shadow-lg active:scale-90 transition-all shrink-0">
            <Send size={20} />
          </button>
        </div>
        
        <p className="hidden md:block text-[9px] text-center text-slate-400 mt-4 uppercase font-bold tracking-widest">
          O Conselheiro IA utiliza visão computacional e análise de dados bancários
        </p>
      </div>
    </div>
  );
};

export default Conselheiro;