import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Users, 
  LogOut, 
  ArrowUpRight,
  Sun,
  Moon,
  Lock,
  CreditCard
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  
  // Controle de Tema (Dark Mode)
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
  const isBasic = user?.plan === 'basic';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* HEADER DO UTILIZADOR */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Olá, {userName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
              PLANO {user?.plan || 'BASIC'}
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium italic">Unidade de Intervenção Ativa</p>
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
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-300 p-3 rounded-2xl hover:text-red-500 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-900/50 transition-all shadow-sm"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* RECURSO ATIVO (BASIC): MONITORAMENTO DE CARTÕES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden transition-colors duration-300">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                <CreditCard size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Monitoramento Open Banking</span>
              </div>
              <h2 className="text-slate-800 dark:text-white font-black text-3xl tracking-tight">Análise de Gastos Ativa</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-md text-sm leading-relaxed font-medium">
                Conecte a sua conta bancária para que a Inteligência Artificial comece a mapear o seu padrão de consumo em tempo real.
              </p>
              <button className="mt-8 bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                Conectar Conta Bancária
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-20 -mt-20 z-0 opacity-60"></div>
          </div>

          {/* GRID DE RECURSOS BLOQUEADOS (UPSELL) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* AGENTE SOMBRA (Premium) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-[2rem] relative overflow-hidden group">
              {isBasic && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center transition-all group-hover:backdrop-blur-sm">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-400 mb-3">
                    <Lock size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
                    Requer Premium
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start mb-6 opacity-40">
                <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl"><Zap size={24} /></div>
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Agente Sombra</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm opacity-40">Vazamentos Ocultos</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1 opacity-40">R$ ???,??</p>
              <p className="text-xs text-slate-400 mt-2 font-medium opacity-40">Varredura de assinaturas inúteis.</p>
            </div>

            {/* ARQUITETO DE HERANÇA (Plus Pro) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-[2rem] relative overflow-hidden group">
              {isBasic && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center transition-all group-hover:backdrop-blur-sm">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-400 mb-3">
                    <Lock size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
                    Requer Plus Pro
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start mb-6 opacity-40">
                <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-2xl"><TrendingUp size={24} /></div>
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Multiplicação</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm opacity-40">Arredondamento & Yu'e Bao</h3>
              <div className="mt-4 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden opacity-40">
                <div className="bg-green-500 h-full w-[30%]"></div>
              </div>
              <p className="text-xs text-slate-400 mt-3 font-medium opacity-40">Investimento automático invisível.</p>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* RECURSO ATIVO (BASIC): AGENTE SENTINELA */}
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
                placeholder="https://shopee.com..." 
                className="w-full bg-indigo-500/50 dark:bg-indigo-800/50 border border-indigo-400/30 dark:border-indigo-700/50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-indigo-500 dark:focus:bg-indigo-700 transition-all placeholder:text-indigo-300 dark:placeholder:text-indigo-400"
              />
              <button className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                <ArrowUpRight size={20} />
              </button>
            </div>
          </div>

          {/* RECURSO BLOQUEADO: EFEITO MANADA (Ultimate) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-[2rem] relative overflow-hidden group">
            {isBasic && (
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center transition-all group-hover:backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-400 mb-3">
                  <Lock size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
                  Requer Ultimate Elite
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 mb-4 opacity-40">
              <Users size={18} className="text-slate-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Psicologia Chinesa</span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm opacity-40">Missão de Equipe (Efeito Manada)</h3>
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

export default Dashboard;