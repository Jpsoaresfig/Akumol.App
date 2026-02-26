import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../api/firebase';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
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
  X,
  MessageSquare
} from 'lucide-react';
import type { UserProfile, PlanLevel } from '../types';

// Tipagem para os Tickets de Suporte
interface SupportTicket {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  type: 'erro' | 'sugestao' | 'duvida';
  message: string;
  status: string;
  createdAt?: Timestamp;
}

const planLevels: PlanLevel[] = ['basic', 'premium', 'plus', 'ultimate'];

const AdminPanel: React.FC = () => {
  const { logout, user: adminUser } = useAuth(); // 'user' renomeado para 'adminUser' para uso no cabeçalho
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tickets'>('overview');

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Busca Usuários
      const userSnap = await getDocs(query(collection(db, "users")));
      const userList = userSnap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
      setUsers(userList);

      // Busca Tickets
      const ticketSnap = await getDocs(query(collection(db, "support_tickets")));
      const ticketList = ticketSnap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket));
      setTickets(ticketList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updatePlan = async (userId: string, newPlan: PlanLevel) => {
    try {
      await updateDoc(doc(db, "users", userId), { plan: newPlan });
      fetchData();
    } catch (error) {
      alert("Erro ao atualizar plano."  + error);
    }
  };

  const deleteTicket = async (id: string) => {
    if (window.confirm("Resolver e remover este reporte?")) {
      await deleteDoc(doc(db, "support_tickets", id));
      setTickets(prev => prev.filter(t => t.id !== id));
    }
  };

  // Resolvendo avisos de variáveis não utilizadas através do uso real na UI
  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.plan !== 'basic').length;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-4">
            <div className="p-2 bg-red-600 rounded-lg text-white"><ShieldAlert size={20} /></div>
            <span className="font-black text-xl">Admin<span className="text-red-600">IA</span></span>
          </div>

          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-500'}`}>
              <LayoutDashboard size={18} /> Visão Geral
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'users' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-500'}`}>
              <Users size={18} /> Usuários
            </button>
            <button onClick={() => setActiveTab('tickets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'tickets' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-500'}`}>
              <MessageSquare size={18} /> Reportes
            </button>
          </nav>
        </div>

        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 text-sm font-medium">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />} Tema
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-black">Olá, {adminUser?.displayName?.split(' ')[0] || 'Admin'}</h1>
            <p className="text-slate-500">Gestão global do ecossistema Akumol.</p>
          </header>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total de Guardiões</h3>
                    <p className="text-5xl font-black">{totalUsers}</p>
                  </div>
                  <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                    <h3 className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">Usuários Premium</h3>
                    <p className="text-5xl font-black">{premiumUsers}</p>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="relative w-full max-w-md group">
                      <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar por nome ou email..."
                        className="w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none text-sm"
                      />
                      {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-3.5 text-slate-400 hover:text-red-500"><X size={16}/></button>}
                    </div>
                  </div>
                  <table className="w-full">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.map(u => (
                        <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-6">
                            <p className="font-bold">{u.displayName}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </td>
                          <td className="p-6">
                            <div className="flex gap-2">
                              {planLevels.map(p => (
                                <button key={p} onClick={() => updatePlan(u.uid!, p)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${u.plan === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                  {p}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="grid gap-4">
                  {tickets.map(t => (
                    <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex justify-between items-center group">
                      <div className="space-y-3">
                        <div className="flex gap-2 items-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.type === 'erro' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{t.type}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{t.createdAt?.toDate().toLocaleDateString('pt-PT')}</span>
                        </div>
                        <p className="text-sm font-medium italic text-slate-600 dark:text-slate-300">"{t.message}"</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t.userName} • {t.userEmail}</p>
                      </div>
                      <button onClick={() => deleteTicket(t.id)} className="p-4 text-slate-300 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-2xl transition-all">
                        <ShieldCheck size={28} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;