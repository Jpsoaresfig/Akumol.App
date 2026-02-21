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
  Crown
} from 'lucide-react';

const DashboardUltimate: React.FC = () => {
  const { user, logout, loading } = useAuth();
  
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
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-amber-600 dark:text-amber-500 font-black animate-pulse tracking-tighter">SINCRONIZANDO GUARDIÃO DIGITAL...</p>
      </div>
    );
  }

  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Investidor';
  const hoursSaved = user?.financialData?.hoursSaved || 342;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* CABEÇALHO VIP */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Olá, {userName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm flex items-center gap-1">
              <Crown size={10} /> ULTIMATE ELITE
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium italic">Acesso Total Liberado</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 p-3 rounded-2xl hover:text-amber-500 transition-all shadow-sm">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={logout} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 p-3 rounded-2xl hover:text-red-500 transition-all shadow-sm">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ARQUITETO DE HERANÇA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group transition-colors duration-300">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-amber-500">
                <Target size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Arquiteto de Herança</span>
              </div>
              <h2 className="text-slate-500 dark:text-slate-400 font-bold text-lg">Liberdade Antecipada em</h2>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-7xl font-black tracking-tighter text-slate-800 dark:text-white">{hoursSaved}</span>
                <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 uppercase">Horas</span>
              </div>
              <p className="text-slate-400 mt-6 max-w-md text-sm leading-relaxed">
                A sua IA converteu arredondamentos e economias de impulso em tempo real de aposentadoria.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 dark:bg-amber-900/10 rounded-full -mr-20 -mt-20 z-0 opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AGENTE SOMBRA */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm transition-colors duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl"><Zap size={24} /></div>
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Agente Sombra</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Vazamentos Detectados</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">R$ 142,90</p>
              <button className="mt-4 w-full py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-700 transition-colors">
                Exterminar Gastos
              </button>
            </div>

            {/* YU'E BAO BRASILEIRO */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm transition-colors duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-2xl"><TrendingUp size={24} /></div>
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Rendimento</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Yu’e Bao Brasileiro</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">R$ 42,30</p>
              <div className="mt-4 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[65%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* EFEITO MANADA (100% DESBLOQUEADO AQUI!) */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-200/50 dark:shadow-none transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Efeito Manada</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Missão de Equipa</h3>
            <p className="text-white/90 text-sm mt-2 font-medium">O seu grupo economizou 85% da meta semanal. Faltam R$ 150 para o bônus!</p>
            <div className="flex -space-x-2 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-amber-500 bg-white flex items-center justify-center text-[10px] text-amber-600 font-bold">U{i}</div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-amber-500 bg-amber-600 flex items-center justify-center text-[10px] text-white font-bold">+6</div>
            </div>
            <button className="mt-6 w-full py-3 bg-white text-amber-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-amber-50 transition-colors">
              Ranking Comunitário
            </button>
          </div>

          {/* AGENTE SENTINELA */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl dark:shadow-none transition-colors duration-300">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck size={20} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Agente Sentinela</span>
            </div>
            <p className="text-2xl font-bold leading-tight">Filtro de 72h</p>
            <div className="mt-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Link do produto..." 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:bg-slate-700 transition-all placeholder:text-slate-500"
              />
              <button className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-500 transition-colors">
                <ArrowUpRight size={20} />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardUltimate;