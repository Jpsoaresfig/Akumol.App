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

// Tipagem segura para os Tickets
interface SupportTicket {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  type: string;
  message: string;
  status: string;
  createdAt?: Timestamp | never; 
}

const planLevels: PlanLevel[] = ['basic', 'premium', 'plus', 'ultimate'];

const AdminPanel: React.FC = () => {
  const { logout, user: adminUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tickets'>('overview');

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Verificação de role
  const isAdmin = adminUser?.role === 'admin';

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
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      const userSnap = await getDocs(query(collection(db, "users")));
      const userList = userSnap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
      setUsers(userList);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }

    try {
      const ticketSnap = await getDocs(query(collection(db, "support_tickets")));
      const ticketList = ticketSnap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket));
      
      setTickets(ticketList.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      }));
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
    }

    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const updatePlan = async (userId: string, newPlan: PlanLevel) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", userId), { plan: newPlan });
      await fetchData(); 
    } catch (error) {
      alert("Erro ao atualizar plano. Verifique as permissões.");
      console.error(error);
      setLoading(false);
    }
  };

  // ✅ NOVA FUNÇÃO: Atualizar o cargo (role) do usuário
  const toggleAdminRole = async (userId: string, currentRole?: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const actionText = newRole === 'admin' ? 'promover a Admin' : 'remover o Admin de';
    
    if (window.confirm(`Tem certeza que deseja ${actionText} este usuário?`)) {
      try {
        setLoading(true);
        await updateDoc(doc(db, "users", userId), { role: newRole });
        await fetchData(); 
      } catch (error) {
        alert("Erro ao atualizar cargo. Verifique as permissões do Firebase.");
        console.error(error);
        setLoading(false);
      }
    }
  };

  const deleteTicket = async (id: string) => {
    if (window.confirm("Resolver e remover este reporte?")) {
      try {
        await deleteDoc(doc(db, "support_tickets", id));
        setTickets(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        alert("Erro ao remover ticket.");
        console.error(error);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.plan !== 'basic').length;

  if (!isAdmin && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
        <p className="mb-6">Você não possui permissão de administrador.</p>
        <button onClick={logout} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold">
          <LogOut size={18} /> Voltar / Sair
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 z-10 md:flex">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-4">
            <div className="p-2 bg-red-600 rounded-lg text-white"><ShieldAlert size={20} /></div>
            <span className="font-black text-xl">Admin<span className="text-red-600">IA</span></span>
          </div>

          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <LayoutDashboard size={18} /> Visão Geral
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'users' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Users size={18} /> Usuários
            </button>
            <button onClick={() => setActiveTab('tickets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'tickets' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <MessageSquare size={18} /> Reportes
            </button>
          </nav>
        </div>

        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />} Tema
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        
        <header className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          <span className="font-black text-xl">Admin<span className="text-red-600">IA</span></span>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('overview')} className="p-2 text-slate-500"><LayoutDashboard size={20}/></button>
            <button onClick={() => setActiveTab('users')} className="p-2 text-slate-500"><Users size={20}/></button>
            <button onClick={() => setActiveTab('tickets')} className="p-2 text-slate-500"><MessageSquare size={20}/></button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto space-y-8">
          <header className="hidden md:block">
            <h1 className="text-3xl font-black tracking-tight">Olá, {adminUser?.displayName?.split(' ')[0] || 'Admin'}</h1>
            <p className="text-slate-500 mt-1">Gestão global do ecossistema Akumol.</p>
          </header>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total de Guardiões</h3>
                    <p className="text-5xl font-black">{totalUsers}</p>
                  </div>
                  <div className="bg-indigo-600 p-8 rounded-4xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                    <h3 className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">Usuários Premium</h3>
                    <p className="text-5xl font-black">{premiumUsers}</p>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in">
                  <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-black">Gestão de Usuários</h2>
                    <div className="relative w-full max-w-sm group">
                      <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar..."
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                      {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-3.5 text-slate-400 hover:text-red-500"><X size={16}/></button>}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-150">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredUsers.map(u => (
                          <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-6">
                              <div className="flex items-center gap-2">
                                <p className="font-bold">{u.displayName || 'Sem Nome'}</p>
                                {/* Tag visual se o usuário já for admin */}
                                {u.role === 'admin' && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 rounded-full text-[9px] font-black uppercase">Admin</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </td>
                            <td className="p-6">
                              <div className="flex flex-wrap items-center gap-2">
                                {planLevels.map(p => (
                                  <button key={p} onClick={() => updatePlan(u.uid!, p)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${u.plan === p ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-indigo-500 hover:text-white'}`}>
                                    {p}
                                  </button>
                                ))}
                                
                                <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                                
                                {/* ✅ A OPÇÃO ADMIN ESTÁ AQUI */}
                                <button 
                                  onClick={() => toggleAdminRole(u.uid!, u.role)} 
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${u.role === 'admin' ? 'bg-red-600 text-white border-red-600 shadow-md hover:bg-red-700' : 'bg-transparent text-red-500 border-red-500 hover:bg-red-500 hover:text-white'}`}
                                >
                                  {u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr><td colSpan={2} className="p-10 text-center text-slate-400">Nenhum usuário encontrado.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4">
                  {tickets.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-400 font-medium">Nenhum reporte no momento.</p>
                    </div>
                  ) : (
                    tickets.map(t => (
                      <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-4xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 group shadow-sm">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.type === 'erro' || t.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                              {t.type === 'erro' || t.type === 'error' ? '🐞 Erro' : '💡 Sugestão/Dúvida'}
                            </span>
                            
                            <span className="text-[10px] text-slate-400 font-bold">
                              {t.createdAt && typeof t.createdAt.toDate === 'function' 
                                ? t.createdAt.toDate().toLocaleDateString('pt-PT') 
                                : 'Data Recente'}
                            </span>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm font-medium italic text-slate-700 dark:text-slate-300 leading-relaxed">"{t.message}"</p>
                          </div>
                          
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            {t.userName || 'Anônimo'} • <span className="opacity-70">{t.userEmail || 'Sem email'}</span>
                          </p>
                        </div>
                        <button 
                          onClick={() => deleteTicket(t.id)} 
                          className="self-start md:self-center p-4 text-slate-300 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-2xl transition-all"
                          title="Resolver e Excluir"
                        >
                          <ShieldCheck size={28} />
                        </button>
                      </div>
                    ))
                  )}
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