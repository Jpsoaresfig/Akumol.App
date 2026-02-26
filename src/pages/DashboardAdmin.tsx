import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../api/firebase';
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { 
  ShieldCheck, 
  Target, 
  Users, 
  LogOut, 
  Sun,
  Moon,
  Activity,
  LifeBuoy,
  MessageCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { UserProfile, PlanLevel } from '../types';

const planLevels: PlanLevel[] = ['basic', 'premium', 'plus', 'ultimate'];

const AdminDashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<any[]>([]); 
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'tickets'>('users');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
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

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const fetchData = useCallback(async () => {
    try {
      setLoadingData(true);
      
      // Busca Usuários
      const usersQuery = query(collection(db, "users"));
      const usersSnap = await getDocs(usersQuery);
      const userList = usersSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
      setAllUsers(userList);

      // Busca Tickets de Suporte/Erros
      const ticketsQuery = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
      const ticketsSnap = await getDocs(ticketsQuery);
      setTickets(ticketsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updatePlan = async (userId: string, newPlan: PlanLevel) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { plan: newPlan });
      await fetchData();
    } catch (error: unknown) {
      alert("Falha ao atualizar plano."+ error);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-600 dark:text-indigo-400 font-black animate-pulse tracking-tighter">CARREGANDO CENTRAL DE COMANDO...</p>
      </div>
    );
  }

  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Admin';
  const totalUsers = allUsers.length;
  const globalHoursSaved = allUsers.reduce((acc, curr) => acc + (curr.financialData?.hoursSaved || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Central de Comando, {userName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">ADMIN</span>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium italic">Monitoramento Global da Plataforma</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            Usuários
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${activeTab === 'tickets' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
          >
            Erros/Tickets {tickets.length > 0 && <span className="bg-white/20 px-1.5 rounded-md">{tickets.length}</span>}
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
          <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-indigo-500 transition-all">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* CARDS DE MÉTRICAS (Sempre visíveis) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-4xl shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl"><Users size={24} /></div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Base</span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Total de Usuários</h3>
            <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">{totalUsers}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-4xl shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-2xl"><Target size={24} /></div>
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Impacto</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Horas Salvas</h3>
              <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">{globalHoursSaved}h</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-4xl shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl"><AlertCircle size={24} /></div>
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Feedback</span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Problemas Relatados</h3>
            <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">{tickets.length}</p>
          </div>
        </div>

        {/* CONTEÚDO DINÂMICO POR ABA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
          
          {activeTab === 'users' ? (
            <>
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
                      <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-5 px-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase">{u.displayName?.charAt(0) || 'U'}</div>
                            <div>
                              <p className="font-bold text-slate-700 dark:text-slate-200">{u.displayName || 'Sem nome'}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-8">
                          <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{u.plan}</span>
                        </td>
                        <td className="py-5 px-8 flex flex-wrap gap-2">
                          {planLevels.map(p => (
                            <button key={p} onClick={() => updatePlan(u.uid, p)} className={`text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase transition-all ${u.plan === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{p}</button>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-6 md:p-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-8">
                <LifeBuoy className="text-red-500" />
                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Erros e Sugestões Reportados</h2>
              </div>
              
              <div className="grid gap-4">
                {tickets.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 italic">Nenhum reporte encontrado.</div>
                ) : (
                  tickets.map(ticket => (
                    <div key={ticket.id} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${ticket.type === 'erro' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {ticket.type === 'erro' ? <AlertCircle size={20} /> : <MessageCircle size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{ticket.userName}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{ticket.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                          <Clock size={12} />
                          {ticket.createdAt?.toDate().toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        {ticket.message}
                      </p>
                      <div className="mt-4 flex justify-end">
                         <span className="text-[9px] text-slate-400 font-medium italic">ID Usuário: {ticket.userId}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;