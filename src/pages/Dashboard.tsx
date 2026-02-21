import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ShieldCheck, 
  Zap, 
  Target, 
  TrendingUp, 
  Users, 
  LogOut, 
  ArrowUpRight 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-600 font-black animate-pulse tracking-tighter">SINCRONIZANDO GUARDIÃO DIGITAL...</p>
      </div>
    );
  }

  // Fallback seguro para evitar erros de renderização de objetos
  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Investidor';
  const hoursSaved = user?.financialData?.hoursSaved || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Olá, {userName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
              {user?.plan || 'BASIC'}
            </span>
            <p className="text-slate-500 text-xs font-medium italic">Unidade de Intervenção Ativa</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="bg-white border border-slate-200 text-slate-400 p-3 rounded-2xl hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
          title="Sair do App"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ARQUITETO DE HERANÇA */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-indigo-600">
                <Target size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Arquiteto de Herança</span>
              </div>
              <h2 className="text-slate-500 font-bold text-lg">Liberdade Antecipada em</h2>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-7xl font-black tracking-tighter text-slate-800">{hoursSaved}</span>
                <span className="text-2xl font-bold text-slate-400 uppercase">Horas</span>
              </div>
              <p className="text-slate-400 mt-6 max-w-md text-sm leading-relaxed">
                A sua IA converteu arredondamentos automáticos em tempo real de aposentadoria.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 z-0 opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AGENTE SOMBRA */}
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><Zap size={24} /></div>
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Agente Sombra</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Vazamentos Detectados</h3>
              <p className="text-2xl font-black text-slate-800 mt-1">R$ 142,90</p>
              <button className="mt-4 w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-800 transition-colors">
                Exterminar Gastos
              </button>
            </div>

            {/* YU'E BAO BRASILEIRO */}
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-green-50 text-green-500 rounded-2xl"><TrendingUp size={24} /></div>
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Rendimento</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Yu’e Bao Brasileiro</h3>
              <p className="text-2xl font-black text-slate-800 mt-1">R$ 42,30</p>
              <div className="mt-4 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[65%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck size={20} className="text-indigo-200" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Agente Sentinela</span>
            </div>
            <p className="text-2xl font-bold leading-tight">Filtro de 72h Ativo</p>
            <div className="mt-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Link do produto..." 
                className="w-full bg-indigo-500/50 border border-indigo-400/30 rounded-xl px-4 py-3 text-sm outline-none focus:bg-indigo-500 transition-all placeholder:text-indigo-300"
              />
              <button className="bg-white text-indigo-600 p-3 rounded-xl hover:bg-indigo-50 transition-colors">
                <ArrowUpRight size={20} />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Efeito Manada</span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Missão de Equipe</h3>
            <div className="flex -space-x-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">U{i}</div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-indigo-100 transition-colors">
              Ranking Comunitário
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;