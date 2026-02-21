import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../api/firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { 
  ShieldCheck, 
  Target, 
  Users, 
  LogOut, 
  Sun,
  Moon,
  Activity,
  Crown
} from 'lucide-react';
import type { UserProfile, PlanLevel } from '../types';

const planLevels: PlanLevel[] = ['basic', 'premium', 'plus', 'ultimate'];

const AdminDashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Estado para controlar o tema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Efeito do Dark Mode
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

  // Busca todos os usuários no Firebase
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => ({ 
        ...doc.data(),
        uid: doc.id 
      } as UserProfile));
      setAllUsers(userList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Função para mudar o plano de um usuário
  const updatePlan = async (userId: string, newPlan: PlanLevel) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { plan: newPlan });
      await fetchUsers(); // Recarrega a lista para mostrar a mudança
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      alert("Falha ao atualizar plano: " + errorMessage);
    }
  };

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-600 dark:text-indigo-400 font-black animate-pulse tracking-tighter">CARREGANDO CENTRAL DE COMANDO...</p>
      </div>
    );
  }

  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Admin';
  
  // Cálculos de Métricas Globais para o Admin
  const totalUsers = allUsers.length;
  const globalHoursSaved = allUsers.reduce((acc, curr) => acc + (curr.financialData?.hoursSaved || 0), 0);
  const premiumUsers = allUsers.filter(u => u.plan !== 'basic').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* HEADER DO ADMIN */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Central de Comando, {userName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
              NÍVEL DEUS (ADMIN)
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium italic">Monitoramento Global da Plataforma</p>
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
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-300 p-3 rounded-2xl hover:text-red-500 dark:hover:text-red-400 transition-all shadow-sm"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* CARDS DE MÉTRICAS GLOBAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total de Usuários */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm transition-colors duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl"><Users size={24} /></div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Base de Dados</span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Total de Usuários Ativos</h3>
            <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">{totalUsers}</p>
          </div>

          {/* Card 2: Horas Globais Salvas */}
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

          {/* Card 3: Assinantes Premium */}
          <div className="bg-indigo-600 dark:bg-indigo-900/80 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none transition-colors duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/20 rounded-2xl"><Crown size={24} className="text-white" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Conversão</span>
            </div>
            <h3 className="font-bold text-white text-sm">Assinantes Pagantes</h3>
            <p className="text-4xl font-black text-white mt-1">{premiumUsers}</p>
            <div className="w-full bg-indigo-800/50 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-white h-full" style={{ width: `${totalUsers > 0 ? (premiumUsers/totalUsers)*100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* TABELA DE GESTÃO DE USUÁRIOS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden transition-colors duration-300">
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
                {allUsers.map(u => (
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
                
                {allUsers.length === 0 && (
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

      </main>
    </div>
  );
};

export default AdminDashboard;