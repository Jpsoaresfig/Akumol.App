import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../api/firebase';
import { collection, query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore'; // Adicionado deleteDoc
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  LayoutDashboard,  
  LogOut, 
  ShieldAlert,
  Sun,
  Moon,
  ShieldCheck,
  Search,
  MessageSquare,
} from 'lucide-react';
import type { UserProfile, PlanLevel } from '../types';

const planLevels: PlanLevel[] = ['basic', 'premium', 'plus', 'ultimate'];

const AdminPanel: React.FC = () => {
  const { logout, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<any[]>([]); // Estado para reportes
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tickets'>('overview');

  // Controle de Tema
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Busca de Usuários
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

  // Busca de Tickets (Bugs/Sugestões)
  const fetchTickets = useCallback(async () => {
    try {
      setLoadingTickets(true);
      const q = query(collection(db, "support_tickets"));
      const querySnapshot = await getDocs(q);
      const ticketList = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      // Ordenar por data decrescente
      setTickets(ticketList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    if (activeTab === 'tickets') fetchTickets();
  }, [fetchUsers, fetchTickets, activeTab]);

  const updatePlan = async (userId: string, newPlan: PlanLevel) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { plan: newPlan });
      await fetchUsers(); 
    } catch (error) {
      alert("Erro ao atualizar plano." + error);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (window.confirm("Marcar este reporte como resolvido e removê-lo?")) {
      try {
        await deleteDoc(doc(db, "support_tickets", ticketId));
        setTickets(prev => prev.filter(t => t.id !== ticketId));
      } catch (error) {
        alert("Erro ao remover ticket." + error);
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return u.displayName?.toLowerCase().includes(searchLower) || u.email?.toLowerCase().includes(searchLower);
  });

  const totalUsers = users.length;
  const globalHoursSaved = users.reduce((acc, curr) => acc + (curr.financialData?.hoursSaved || 0), 0);
  const premiumUsers = users.filter(u => u.plan !== 'basic').length;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between z-10">
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
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
              <LayoutDashboard size={18} /> Visão Geral
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
              <Users size={18} /> Gestão de Usuários
            </button>
            <button onClick={() => setActiveTab('tickets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'tickets' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'text-slate-500'}`}>
              <MessageSquare size={18} /> Central de Reportes
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 text-sm font-medium">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />} Mudar Tema
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-bold text-sm">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            
            <header>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white uppercase">
                {activeTab === 'overview' ? 'Visão Geral' : activeTab === 'users' ? 'Usuários' : 'Reportes & Bugs'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {activeTab === 'tickets' ? 'Gerencie o feedback e os erros encontrados pelos usuários.' : 'Gestão estratégica da plataforma.'}
              </p>
            </header>

            {/* CONTEÚDO DINÂMICO */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-slate-500 text-xs font-black uppercase mb-2">Usuários</h3>
                  <p className="text-4xl font-black">{totalUsers}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-slate-500 text-xs font-black uppercase mb-2">Horas Salvas</h3>
                  <p className="text-4xl font-black text-green-500">{globalHoursSaved}h</p>
                </div>
                <div className="bg-indigo-600 p-6 rounded-4xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                  <h3 className="text-indigo-100 text-xs font-black uppercase mb-2">Premium</h3>
                  <p className="text-4xl font-black">{premiumUsers}</p>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Pesquisar..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm"
                    />
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="p-6 text-left">Usuário</th>
                      <th className="p-6 text-left">Plano</th>
                      <th className="p-6 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map(u => (
                      <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6">
                          <p className="font-bold text-sm">{u.displayName}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </td>
                        <td className="p-6">
                          <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{u.plan}</span>
                        </td>
                        <td className="p-6 flex gap-1">
                          {planLevels.map(p => (
                            <button key={p} onClick={() => updatePlan(u.uid, p)} className={`text-[9px] font-bold px-2 py-1 rounded uppercase transition-all ${u.plan === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-indigo-500 hover:text-white'}`}>
                              {p}
                            </button>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {loadingTickets ? (
                  <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : tickets.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-slate-400 font-bold">Nenhum ticket aberto.</p>
                  </div>
                ) : (
                  tickets.map(ticket => (
                    <div key={ticket.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between gap-4 group">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            ticket.type === 'erro' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 
                            ticket.type === 'sugestao' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 
                            'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                          }`}>
                            {ticket.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{ticket.createdAt?.toDate().toLocaleString('pt-PT')}</span>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed">"{ticket.message}"</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 text-[10px]">
                            {ticket.userName?.charAt(0)}
                          </div>
                          {ticket.userName} <span className="opacity-50">• {ticket.userEmail}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => deleteTicket(ticket.id)}
                        className="self-start md:self-center p-4 text-slate-300 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-2xl transition-all"
                        title="Marcar como resolvido"
                      >
                        <ShieldCheck size={24} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;