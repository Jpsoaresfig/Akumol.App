import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 underline decoration-indigo-500 underline-offset-4">
            Painel Liberdade
          </h1>
          <p className="text-slate-500 font-medium">Bem-vindo, {user?.displayName}</p>
        </div>
        <button onClick={logout} className="bg-white text-red-500 border border-red-100 px-6 py-2 rounded-2xl font-bold shadow-sm hover:bg-red-50 transition-all">
          Sair
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card: Arquiteto de Herança */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Arquiteto de Herança</span>
          <h3 className="text-slate-400 text-sm font-medium mt-1">Liberdade Antecipada</h3>
          <p className="text-5xl font-black text-slate-800 mt-4">{user?.hoursSaved || 0}h</p>
          <div className="mt-6 flex items-center text-green-500 font-bold text-sm">
            <span>↑ 12.5%</span>
            <span className="text-slate-300 ml-2 font-normal">vs mês anterior</span>
          </div>
        </div>

        {/* Card: Agente Sentinela */}
        <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-indigo-200 font-bold text-xs uppercase tracking-widest">Agente Sentinela</span>
            <h3 className="text-xl font-bold mt-1">Proteção Ativa</h3>
            <p className="text-indigo-100 text-sm mt-4 opacity-80">O filtro pré-compra está analisando seus desejos de consumo.</p>
            <button className="mt-8 bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform">
              Analisar Checkout
            </button>
          </div>
          {/* Decoração visual de fundo */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20"></div>
        </div>

        {/* Card Status do Plano */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Nível de Acesso</span>
            <p className="text-2xl font-black text-slate-800 mt-2 uppercase">{user?.plan}</p>
          </div>
          <p className="text-slate-400 text-sm italic">"A economia acontece por acidente."</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;