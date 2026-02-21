import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { 
  ShieldCheck, 
  Zap, 
  Target,
  TrendingUp, 
  Users, 
  LogOut, 
  ArrowUpRight,
  Sun,
  Moon,
  Lock
} from 'lucide-react';

const DashboardPlus: React.FC = () => {
  const { user, logout, loading } = useAuth();
  
  // Controlo de Tema (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-600 dark:text-indigo-400 font-black animate-pulse tracking-tighter">SINCRONIZANDO GUARDIÃO DIGITAL...</p>
      </div>
    );
  }

  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Investidor';
  const hoursSaved = user?.financialData?.hoursSaved || 142; // Valor de exemplo para visualização

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* CABEÇALHO DO UTILIZADOR */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Olá, {userName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
              PLANO PLUS PRO
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium italic">Multiplicação Ativa</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-300 p-3 rounded-2xl hover:text-indigo-500 dark:hover:text-indigo-400 transition-all shadow-sm"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={logout}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-300 p-3 rounded-2xl hover:text-red-500 dark:hover:text-red-400 transition-all shadow-sm"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* RECURSO ATIVO (PLUS): ARQUITETO DE HERANÇA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group transition-colors duration-300">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                <Target size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Arquiteto de Herança</span>
              </div>
              <h2 className="text-slate-500 dark:text-slate-400 font-bold text-lg">Liberdade Antecipada em</h2>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-7xl font-black tracking-tighter text-slate-800 dark:text-white">{hoursSaved}</span>
                <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 uppercase">Horas</span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 mt-6 max-w-md text-sm leading-relaxed">
                A sua IA converteu os arredondamentos automáticos das suas compras desta semana em tempo real de aposentadoria.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full -mr-20 -mt-20 z-0 opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* RECURSO ATIVO (PREMIUM/PLUS): AGENTE SOMBRA */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm transition-colors duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl"><Zap size={24} /></div>
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Agente Sombra</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Vazamentos Detectados</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">R$ 142,90</p>
              <button className="mt-4 w-full py-3 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                Exterminar Gastos
              </button>
            </div>

            {/* RECURSO ATIVO (PLUS): YU'E BAO BRASILEIRO */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm transition-colors duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl"><TrendingUp size={24} /></div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Rendimento Vivo</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Yu’e Bao Brasileiro</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">R$ 42,30</p>
              <div className="mt-4 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[65%]"></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Disponível para gastos básicos</p>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* RECURSO ATIVO (TODOS): AGENTE SENTINELA */}
          <div className="bg-indigo-600 dark:bg-indigo-900/80 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none transition-colors duration-300">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck size={20} className="text-indigo-200 dark:text-indigo-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 dark:text-indigo-300">Agente Sentinela</span>
            </div>
            <p className="text-2xl font-bold leading-tight tracking-tight">Filtro de 72h Ativo</p>
            <p className="text-indigo-200 text-sm mt-3 font-medium leading-relaxed">
              Cole o link do produto que quer comprar. A IA vai calcular as "Horas de Vida" e aplicar o bloqueio preventivo.
            </p>
            <div className="mt-6 flex gap-2">
              <input 
                type="text" 
                placeholder="https://amazon.com..." 
                className="w-full bg-indigo-500/50 dark:bg-indigo-800/50 border border-indigo-400/30 dark:border-indigo-700/50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-indigo-500 dark:focus:bg-indigo-700 transition-all placeholder:text-indigo-300 dark:placeholder:text-indigo-400"
              />
              <button className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                <ArrowUpRight size={20} />
              </button>
            </div>
          </div>

          {/* RECURSO BLOQUEADO: EFEITO MANADA (Exclusivo Ultimate) */}
          <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center transition-all group-hover:backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-400 dark:text-slate-300 mb-3">
                <Lock size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-sm">
                Desbloquear Ultimate Elite
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4 opacity-40">
              <Users size={18} className="text-slate-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Psicologia Chinesa</span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm opacity-40">Missão de Equipa (Efeito Manada)</h3>
            <div className="flex -space-x-2 mt-4 opacity-40">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[10px] text-slate-500 font-bold">U{i}</div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPlus;