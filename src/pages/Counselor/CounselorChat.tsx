import React, { useState } from 'react';
import { 
  Camera, 
  Mic, 
  Video, 
  Send, 
  BrainCircuit, 
  Paperclip
} from 'lucide-react';

const Conselheiro = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
      {/* HEADER DA IA */}
      <header className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-black text-xl text-slate-800 dark:text-white leading-none">Conselheiro Akumol</h1>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Analisando seu Patrimônio em tempo real
            </span>
          </div>
        </div>
        
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
          <Video size={18} />
          <span className="hidden md:inline">Vídeo Chamada IA</span>
        </button>
      </header>

      {/* ÁREA DE CHAT / ANÁLISE */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            "Olá! Sou seu Conselheiro de Compras. Antes de gastar, me mostre o que você quer. 
            Você pode me enviar uma **foto do produto**, um **áudio** explicando sua necessidade ou iniciarmos uma **vídeo chamada** para eu analisar o item ao vivo."
          </p>
        </div>
        
        {/* Exemplo de Resposta da IA baseada na conta do usuário */}
        <div className="max-w-3xl mx-auto flex gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
             <BrainCircuit size={20} className="text-white" />
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-3xl rounded-tl-none border border-indigo-100 dark:border-indigo-500/20">
            <h4 className="font-black text-indigo-600 dark:text-indigo-400 text-xs uppercase mb-2">Análise de Viabilidade</h4>
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              Baseado no seu saldo atual e na sua meta de "Liberdade IA", essa compra comprometeria 12% da sua reserva de emergência. 
              Recomendo aguardar a promoção da próxima semana que detectei no meu radar.
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE INPUT MULTIMÍDIA */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-2 flex items-end gap-2">
            <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
              <Paperclip size={20} />
            </button>
            <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
              <Camera size={20} />
            </button>
            <textarea 
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Pergunte sobre uma compra..."
              className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-slate-700 dark:text-white placeholder:text-slate-400 resize-none"
            />
            <button 
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={() => setIsRecording(false)}
              className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              <Mic size={20} />
            </button>
          </div>
          <button className="bg-indigo-600 p-4 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-all active:scale-90">
            <Send size={20} />
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-400 mt-4 uppercase font-bold tracking-widest">
          O Conselheiro IA utiliza visão computacional e análise de dados bancários
        </p>
      </div>
    </div>
  );
};

export default Conselheiro;