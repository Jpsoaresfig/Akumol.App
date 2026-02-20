import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  // Adicionamos 'loading' para evitar tentar ler dados antes do Firebase responder
  const { user, logout, loading } = useAuth();

  // Enquanto os dados estão sendo buscados no Firestore, exibimos um estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-indigo-600 font-bold animate-pulse text-xl">
          Sincronizando com o Guardião Digital...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg p-6 md:p-12 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-text tracking-tight">
            Olá, {user?.displayName || 'Investidor'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Plano atual: <span className="text-brand-primary font-bold uppercase tracking-wider">{user?.plan}</span>
          </p>
        </div>
        <button 
          onClick={logout} 
          className="bg-white text-red-500 border border-red-100 px-6 py-2.5 rounded-2xl font-bold shadow-sm hover:bg-red-50 hover:shadow-md transition-all active:scale-95"
        >
          Sair do App
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card: Projeção de Liberdade - Arquiteto de Herança */}
        <div className="glass-card p-8 group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Horas de Vida Ganhas</h3>
            <span className="bg-green-100 text-green-600 p-2 rounded-lg text-xs font-bold">↑ 12%</span>
          </div>
          <p className="text-6xl font-black text-brand-text leading-none">
            {/* Usamos user?.hoursSaved conforme definido em types/index.ts */}
            {user?.hoursSaved || 0}<span className="text-2xl ml-1 text-slate-400 font-bold">h</span>
          </p>
          <p className="text-sm text-slate-400 mt-6 font-medium">
            Você antecipou sua liberdade em <span className="text-slate-600 font-bold">3 dias</span> este mês.
          </p>
        </div>

        {/* Card: Agente Sentinela (Intervenção Comportamental) */}
        <div className="bg-brand-primary p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] mb-6">Agente Sentinela</h3>
            <p className="text-2xl font-bold leading-tight">Proteção Ativa contra Impulso</p>
            <p className="text-indigo-100/80 text-sm mt-4 font-medium">
              O filtro de 72h está operando. Nenhuma compra detectada em "maturação".
            </p>
            <button className="mt-8 w-full bg-white text-brand-primary py-4 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors shadow-lg shadow-black/10">
              Analisar Checkout
            </button>
          </div>
          {/* Elemento Visual de Fundo */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500 rounded-full opacity-20 group-hover:scale-110 transition-transform duration-500"></div>
        </div>

        {/* Card: Gamificação - Yu’e Bao Brasileiro */}
        <div className="glass-card p-8 group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Rendimento Yu’e Bao</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-4xl font-black text-brand-text">
            R$ 42,30
          </p>
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">CDI Diário com Liquidez</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[65%]"></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 text-center font-medium italic">
            "Saldo pronto para uso em gastos básicos."
          </p>
        </div>
      </main>

      {/* Footer: Resumo Behavioral */}
      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest gap-4">
        <div>Liberdade IA • Unidade de Intervenção Comportamental</div>
        <div className="flex gap-6">
          <span className="text-brand-primary">Fricção Zero</span>
          <span>Efeito Manada</span>
          <span>Consumo Consciente</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;