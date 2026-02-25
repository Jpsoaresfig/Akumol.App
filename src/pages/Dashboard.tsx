import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ShieldCheck, Zap, TrendingUp, Users, LogOut, 
  ArrowUpRight, Sun, Moon, Lock, CreditCard, Target, Crown, 
  Clock, AlertCircle 
} from 'lucide-react';

// --- SUB-COMPONENTES DE INTERFACE ---

const SentinelaWidget = ({ hourlyRate = 50 }: { hourlyRate?: number }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ price: number; lifeHours: number } | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const analisarCompra = () => {
    if (!url) return;
    setIsAnalyzing(true);
    
    // Simulação de delay de IA e extração de preço
    setTimeout(() => {
      const precoSimulado = Math.floor(Math.random() * (800 - 100 + 1)) + 100; 
      const horas = precoSimulado / hourlyRate;
      
      setAnalysis({
        price: precoSimulado,
        lifeHours: parseFloat(horas.toFixed(1))
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleLock = () => {
    setIsLocked(true);
    // Aqui no futuro dispararemos o salvamento no Firestore
  };

  return (
    <div className="bg-indigo-600 dark:bg-indigo-900/80 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-indigo-200 dark:text-indigo-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 dark:text-indigo-300">Agente Sentinela</span>
        </div>
        {isLocked && <span className="bg-red-500 text-[8px] font-bold px-2 py-1 rounded-full animate-pulse">BLOQUEIO ATIVO</span>}
      </div>

      {!analysis && !isLocked ? (
        <>
          <p className="text-2xl font-bold leading-tight tracking-tight">Filtro de 72h Ativo</p>
          <div className="mt-6 flex gap-2">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={isAnalyzing ? "Analisando..." : "Link do produto..."} 
              disabled={isAnalyzing}
              className="w-full bg-indigo-500/50 dark:bg-indigo-800/50 border border-indigo-400/30 dark:border-indigo-700/50 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-indigo-300 disabled:opacity-50" 
            />
            <button 
              onClick={analisarCompra}
              disabled={isAnalyzing || !url}
              className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? <Clock size={20} className="animate-spin" /> : <ArrowUpRight size={20} />}
            </button>
          </div>
        </>
      ) : isLocked ? (
        <div className="text-center py-4 animate-in zoom-in duration-300">
          <AlertCircle size={40} className="mx-auto mb-3 text-indigo-200" />
          <p className="font-bold text-lg">Desejo em Maturação</p>
          <p className="text-xs text-indigo-200 mt-1">Volte em 72 horas para decidir se este gasto ainda faz sentido.</p>
          <button 
            onClick={() => {setAnalysis(null); setIsLocked(false); setUrl('');}}
            className="mt-4 text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100"
          >
            Cancelar Bloqueio
          </button>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-2 text-indigo-200">
            <Clock size={14} />
            <span className="text-[10px] font-bold uppercase">Custo de Vida Real</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">
            {analysis?.lifeHours} Horas
          </h2>
          <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
            Isto custa <span className="text-white font-bold">{Math.ceil((analysis?.lifeHours || 0) / 8)} dias</span> inteiros de trabalho.
          </p>
          
          <div className="mt-6 space-y-2">
            <button 
              onClick={handleLock}
              className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl text-sm shadow-lg active:scale-95 transition-transform"
            >
              Ativar Bloqueio de 72h
            </button>
            <button 
              onClick={() => {setAnalysis(null); setUrl('');}}
              className="w-full bg-indigo-500/30 text-white font-bold py-3 rounded-xl text-xs opacity-80 hover:opacity-100 transition-opacity"
            >
              Assumir Risco e Comprar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const LockedWidget = ({ title, planName }: { title: string, planName: string }) => (
  <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 p-6 rounded-4xl relative overflow-hidden group">
    <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-400 mb-3"><Lock size={20} /></div>
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-sm">
        Desbloquear {planName}
      </span>
    </div>
    <h3 className="font-bold text-slate-400 text-sm">{title}</h3>
    <div className="h-20" />
  </div>
);

// --- COMPONENTE PRINCIPAL ---

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-indigo-600 font-black animate-pulse">SINCRONIZANDO GUARDIÃO DIGITAL...</p>
    </div>
  );

  const plan = user?.plan || 'basic';
  const userName = user?.displayName?.split(' ')[0] || 'Investidor';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Olá, {userName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm text-white ${
              plan === 'ultimate' ? 'bg-linear-to-r from-amber-400 to-orange-500' :
              plan === 'plus' ? 'bg-emerald-500' :
              plan === 'premium' ? 'bg-purple-600' : 'bg-slate-800'
            }`}>
              {plan === 'ultimate' && <Crown size={10} className="inline mr-1" />}
              PLANO {plan.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={logout} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* BLOCO DE DINHEIRO E PATRIMÓNIO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Património Total</p>
              <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                {formatCurrency(user?.financialData?.totalInvested || 0)}
              </h2>
              <div className="flex items-center gap-2 mt-4 text-emerald-500 font-bold text-sm">
                <TrendingUp size={16} />
                <span>+ 8.4% este mês</span>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 flex gap-4 relative z-10">
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-transform">
                Depositar
              </button>
              <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Retirar
              </button>
            </div>

            <div className={`absolute -right-10 -bottom-10 opacity-5 dark:opacity-10 ${
              plan === 'ultimate' ? 'text-amber-500' : 'text-indigo-500'
            }`}>
              <ShieldCheck size={240} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Saldo em Conta</p>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">
              {formatCurrency(1250.45)} 
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-medium italic">Disponível para transações</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            
            {/* AGENTE SOMBRA */}
            {['premium', 'plus', 'ultimate'].includes(plan) ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                 <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-red-500"><Zap size={18} /><span className="text-xs font-black uppercase tracking-widest">Agente Sombra</span></div>
                  <h2 className="text-slate-800 dark:text-white font-black text-3xl tracking-tight">Vazamentos Ocultos</h2>
                  <p className="text-6xl font-black text-red-500 mt-2">R$ 142,90</p>
                  <button className="mt-8 bg-red-500 text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg shadow-red-500/30 active:scale-95 transition-transform">Exterminar Gastos</button>
                </div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-red-50 dark:bg-red-900/10 rounded-full -mr-24 -mt-24 opacity-60"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-indigo-600"><CreditCard size={18} /><span className="text-xs font-black uppercase tracking-widest">Monitorização</span></div>
                <h2 className="text-slate-800 dark:text-white font-black text-3xl tracking-tight">Análise de Gastos</h2>
                <button className="mt-8 bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl text-sm active:scale-95 transition-transform">Lugar Conta Bancária</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['plus', 'ultimate'].includes(plan) ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-4xl shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-2xl"><Target size={24} /></div>
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Herança</span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Horas de Vida Salvas</h3>
                  <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">{user?.financialData?.hoursSaved || 0}h</p>
                </div>
              ) : (
                <LockedWidget title="Arquiteto de Herança" planName="Plus Pro" />
              )}

              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-4xl shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl"><TrendingUp size={24} /></div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Rendimento</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Yu’e Bao Brasileiro</h3>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">R$ 42,30</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <SentinelaWidget hourlyRate={user?.financialData?.totalInvested ? 60 : 40} />

            {plan === 'ultimate' ? (
              <div className="bg-linear-to-br from-amber-400 to-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-200/50 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-4"><Users size={20} className="text-white" /><span className="text-[10px] font-black uppercase tracking-widest text-white/90">Efeito Manada</span></div>
                <h3 className="text-2xl font-bold tracking-tight">Missão de Equipa</h3>
                <p className="text-white/90 text-sm mt-2 font-medium">Economia coletiva em 85%.</p>
                <button className="mt-6 w-full py-3 bg-white text-amber-600 rounded-xl font-bold text-[10px] uppercase tracking-wider active:scale-95 transition-transform">Ver Ranking</button>
              </div>
            ) : (
              <LockedWidget title="Efeito Manada" planName="Ultimate Elite" />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;