import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { StatusBar, Style } from '@capacitor/status-bar';

const routeTitles: Record<string, string> = {
  '/': 'Início',
  '/evolucao': 'Evolução',
  '/goals': 'Metas',
  '/conselheiro': 'Conselheiro',
  '/agentes': 'Agentes',
  '/perfil': 'Meu Perfil',
  '/suporte': 'Suporte',
  '/admin': 'Painel Admin',
};

const UserHeader: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark';
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    const apply = async () => {
      if (isDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        try { await StatusBar.setStyle({ style: Style.Dark }); await StatusBar.setBackgroundColor({ color: '#020617' }); } catch { /* web */ }
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        try { await StatusBar.setStyle({ style: Style.Light }); await StatusBar.setBackgroundColor({ color: '#F8FAFC' }); } catch { /* web */ }
      }
    };
    apply();
  }, [isDark]);

  if (!user) return null;

  const path = location.pathname;
  const pageTitle = routeTitles[path] ?? (path.startsWith('/agentes/') ? 'Agentes' : 'Akumol');
  const initial = (user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? 'U').toUpperCase();

  return (
    <header className="w-full h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-40 shadow-sm shrink-0">
      <div>
        <h1 className="text-base font-bold text-slate-800 dark:text-white leading-none">{pageTitle}</h1>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Akumol IA</span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
          aria-label="Alternar tema"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        <div
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-none">
              {user.displayName?.split(' ')[0] ?? 'Usuário'}
            </span>
            <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-tight mt-0.5">
              {user.plan ?? 'basic'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-indigo-100 dark:ring-slate-700 shadow-md group-hover:-translate-y-0.5 transition-transform duration-200">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm">
                {initial}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
