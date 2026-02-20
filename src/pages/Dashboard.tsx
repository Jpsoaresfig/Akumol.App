import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Olá, {user?.displayName}</h1>
          <p className="text-slate-500 font-medium italic">Seu plano: <span className="text-indigo-600 uppercase">{user?.plan}</span></p>
        </div>
        <button onClick={logout} className="bg-white text-red-500 border border-red-100 px-6 py-2 rounded-2xl font-bold hover:bg-red-50 shadow-sm transition-all">
          Sair
        </button>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card: Projeção de Liberdade */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Horas de Vida Ganhas</h3>
          <p className="text-5xl font-black text-slate-800 mt-4">{user?.financialData.hoursSaved || 0}h</p>
          <p className="text-xs text-green-500 font-bold mt-4">↑ 12% em relação ao mês anterior</p>
        </div>

        {/* Card: Agente Sentinela */}
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 text-white">
          <h3 className="text-indigo-100 text-sm font-bold uppercase tracking-wider">Agente Sentinela</h3>
          <p className="text-xl font-bold mt-2">Proteção Ativa</p>
          <p className="text-indigo-200 text-sm mt-2 opacity-80">Nenhuma compra por impulso detectada nas últimas 24h.</p>
          <button className="mt-8 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform">
            Analisar Checkout
          </button>
        </div>

        {/* Card: Gamificação (Yu’e Bao) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Rendimento Yu’e Bao</h3>
          <p className="text-3xl font-black text-slate-800 mt-4">R$ 42,30</p>
          <p className="text-xs text-slate-400 mt-2">Saldo pronto para uso imediato.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;