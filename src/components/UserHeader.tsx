import React from 'react';
import { useAuth } from '../hooks/useAuth';

const UserHeader: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const initial = user.displayName?.charAt(0) || user.email?.charAt(0) || 'U';

  return (
    <header className="w-full h-20 flex items-center justify-between px-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Título dinâmico ou saudação (Opcional) */}
      <div className="hidden md:block">
        <h1 className="text-slate-400 font-medium text-sm tracking-widest uppercase">
          Painel de Controle
        </h1>
      </div>

      {/* Área do Perfil - Lado Direito */}
      <div className="flex items-center gap-4 group cursor-pointer p-1.5 pr-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300">
        
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">
            {user.displayName || 'Usuário'}
          </span>
          <span className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 mt-1 uppercase tracking-tighter">
            Plano {user.plan || 'Free'}
          </span>
        </div>

        <div className="relative">
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-md transform group-hover:rotate-3 transition-transform">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold">
                {initial}
              </div>
            )}
          </div>
          {/* Status Online */}
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;