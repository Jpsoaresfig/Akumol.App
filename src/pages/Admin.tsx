import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../api/firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  LayoutDashboard, 
  Crown, 
  LogOut, 
  ShieldAlert,
  Sun,
  Moon,
  Target,
  Activity,
  ShieldCheck
} from 'lucide-react';
import type { UserProfile, PlanLevel } from '../types';

const planLevels: PlanLevel[] = ['basic', 'premium', 'plus', 'ultimate'];

const AdminPanel: React.FC = () => {
  const { logout, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Estado para controlar a aba ativa ('overview' ou 'users')
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');

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

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => ({ 
        ...doc.data(),
        uid: doc.id 
      } as UserProfile));
      setUsers(userList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const updatePlan = async (userId: string, newPlan: PlanLevel) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { plan: newPlan });
      await fetchUsers(); 
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      alert("Falha ao atualizar plano: " + errorMessage);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) await fetchUsers();
    };
    loadData();
    return () => { isMounted = false; };
  }, [fetchUsers]);

  // Cálculos de Métricas Globais
  const totalUsers = users.length;
  const globalHoursSaved = users.reduce((acc, curr) => acc + (curr.financialData?.hoursSaved || 0), 0);
  const premiumUsers = users.filter(u => u.plan !== 'basic').length;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      
      {/* ABA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors duration-300 z-10 hidden md:flex">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                <ShieldAlert size={18} className="text-white" />
              </div>
              <span className="font-black text-lg tracking-tight">Admin<span className="text-red-500">IA</span></span>
            </div>
          </div>

          <nav className="p-4 space-y-2 mt-4">
            {/* Botão: Visão Geral */}
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'overview' 
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Visão Geral</span>
            </button>

            {/* Botão: Gestão de Usuários */}
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'users' 
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Users size={18} />
              <span>Gestão de Usuários</span>
            </button>

            {/* Botão: Editar Planos (Em breve) */}
            <button 
              disabled
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 dark:text-slate-600 font-medium text-sm transition-all opacity-70 cursor-not-allowed"
            >
              <Crown size={18} />
              <span>Editar Planos</span>
              <span className="ml-auto text-[8px] uppercase font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Em breve</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>Mudar Tema</span>
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL (CONTEÚDO) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <span className="font-black text-lg tracking-tight">Admin<span className="text-red-500">IA</span></span>
          <button onClick={logout} className="text-red-500 p-2"><LogOut size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Cabeçalho Dinâmico da Página */}
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                {activeTab === 'overview' ? `Central de Comando, ${user?.displayName?.split(' ')[0] || 'Admin'}` : 'Gestão de Usuários'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'overview' 
                  ? 'Monitoramento Global da Plataforma e impacto dos agentes.'
                  : 'Controle quem tem acesso aos agentes e funcionalidades do Liberdade IA.'}
              </p>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-20">
                 <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* ABA 1: VISÃO GERAL (MÉTRICAS) */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm transition-colors duration-300">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl"><Users size={24} /></div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Base de Dados</span>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm">Total de Usuários Ativos</h3>
                      <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">{totalUsers}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm transition-colors duration-300 relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-2xl"><Target size={24} /></div>
                          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Impacto Global</span>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Horas de Vida Devolvidas</h3>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">{globalHoursSaved} <span className="text-xl text-slate-400">h</span></p>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/10 rounded-full -mr-10 -mt-10 z-0"></div>
                    </div>

                    <div className="bg-indigo-600 dark:bg-indigo-900/80 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none transition-colors duration-300">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/20 rounded-2xl"><Crown size={24} className="text-white" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Conversão</span>
                      </div>
                      <h3 className="font-bold text-white text-sm">Assinantes Pagantes</h3>
                      <p className="text-4xl font-black text-white mt-1">{premiumUsers}</p>
                      <div className="w-full bg-indigo-800/50 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-white h-full transition-all duration-1000" style={{ width: `${totalUsers > 0 ? (premiumUsers/totalUsers)*100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ABA 2: GESTÃO DE USUÁRIOS (TABELA) */}
                {activeTab === 'users' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden transition-colors duration-300 animate-in fade-in duration-300">
                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <Activity className="text-indigo-500" />
                      <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Gestão de Agentes e Planos</h2>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          <tr>
                            <th className="py-4 px-8">Usuário</th>
                            <th className="py-4 px-8">Plano Atual</th>
                            <th className="py-4 px-8">Atribuir Nível</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {users.map(u => (
                            <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-5 px-8">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase">
                                    {u.displayName ? u.displayName.charAt(0) : 'U'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{u.displayName || 'Sem nome'}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 px-8">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck size={16} className={u.plan === 'basic' ? 'text-slate-400' : 'text-indigo-500'} />
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    {u.plan}
                                  </span>
                                </div>
                              </td>
                              <td className="py-5 px-8 flex flex-wrap gap-2">
                                {planLevels.map(p => (
                                  <button 
                                    key={p}
                                    onClick={() => updatePlan(u.uid, p)}
                                    className={`text-[10px] px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all ${
                                      u.plan === p 
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </td>
                            </tr>
                          ))}
                          
                          {users.length === 0 && (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                                Nenhum utilizador encontrado na base de dados.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;