import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; // Importado para navegação

const UserHeader: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Inicialização do hook de navegação

  if (!user) return null;

  const initial = user.displayName?.charAt(0) || user.email?.charAt(0) || 'U';

  return (
    <header className="w-full h-20 flex items-center justify-between px-6 md:px-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-50 shadow-sm">
      {/* Lado Esquerdo: Título com Badge */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col">
          <h1 className="text-slate-800 dark:text-white font-bold text-lg tracking-tight">
            Dashboard
          </h1>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
            Sistema de Gestão
          </span>
        </div>
      </div>

      {/* Lado Direito: Área do Usuário */}
      <div className="flex items-center gap-5">
        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        {/* Área do Perfil com Navegação - Ajustada com onClick e cursor pointer */}
        <div 
          onClick={() => navigate('/evolucao')} // Navega para a página de perfil (Evolução) ao clicar
          className="flex items-center gap-4 group cursor-pointer transition-all duration-300 ease-in-out"
        >
          <div className="flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {user.displayName || 'Usuário'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-tighter">
                {user.plan || 'Plano Free'}
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-indigo-50 dark:ring-slate-800 shadow-lg group-hover:shadow-indigo-100 dark:group-hover:shadow-none transform group-hover:-translate-y-1 transition-all duration-300">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-black shadow-inner">
                  {initial}
                </div>
              )}
            </div>
            {/* Overlay sutil no hover */}
            <div className="absolute inset-0 rounded-2xl bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;