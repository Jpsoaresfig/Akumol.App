import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../api/firebase';
import {
  collection, query, getDocs, updateDoc, doc,
  deleteDoc, getDoc, setDoc
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import {
  Users, LayoutDashboard, LogOut, ShieldAlert, ShieldCheck,
  Search, X, MessageSquare, Bot, Eye, EyeOff, Save,
  CheckCircle2, AlertCircle, Circle, Zap, Target,
  HeartPulse, Brain, RefreshCw, KeyRound
} from 'lucide-react';
import type { UserProfile, PlanLevel, SupportTicket } from '../types';

interface AgentsConfig {
  geminiApiKey: string;
  enabled: Record<string, boolean>;
}

const DEFAULT_CONFIG: AgentsConfig = {
  geminiApiKey: '',
  enabled: {
    sentinela: true,
    sombra: true,
    radar: true,
    dopamina: true,
    arquiteto: true,
    conselheiro: true,
    resiliencia: false,
  },
};

const AGENTS_INFO = [
  {
    id: 'conselheiro',
    name: 'Conselheiro',
    description: 'Chat financeiro com IA Gemini. Acessa saldo e investimentos em tempo real.',
    icon: Brain,
    color: 'bg-indigo-500',
    plan: 'Todos os planos',
    needs: ['gemini', 'none_function'],
    path: '/conselheiro',
  },
  {
    id: 'radar',
    name: 'Radar',
    description: 'Busca promoções, cashbacks e cupons reais via Gemini + Google Search.',
    icon: Target,
    color: 'bg-blue-500',
    plan: 'Premium+',
    needs: ['gemini', 'google_search'],
    path: '/agentes/radar',
  },
  {
    id: 'sombra',
    name: 'Sombra',
    description: 'Detecta assinaturas e gastos inúteis. Dados salvos no Firestore do usuário.',
    icon: Zap,
    color: 'bg-red-500',
    plan: 'Premium+',
    needs: ['firestore'],
    path: '/agentes/sombra',
  },
  {
    id: 'sentinela',
    name: 'Sentinela',
    description: 'Filtro de 72h contra compras impulsivas. 100% frontend, sem API externa.',
    icon: ShieldCheck,
    color: 'bg-indigo-600',
    plan: 'Todos os planos',
    needs: [],
    path: '/agentes/sentinela',
  },
  {
    id: 'dopamina',
    name: 'Dopamina',
    description: 'Bloqueia gastos por humor e estresse. 100% frontend, sem API externa.',
    icon: HeartPulse,
    color: 'bg-pink-500',
    plan: 'Plus+',
    needs: [],
    path: '/agentes/dopamina',
  },
  {
    id: 'arquiteto',
    name: 'Arquiteto',
    description: 'Calcula herança financeira e aposentadoria com dados do Firestore.',
    icon: Brain,
    color: 'bg-emerald-500',
    plan: 'Plus+',
    needs: ['firestore'],
    path: '/agentes/arquiteto',
  },
  {
    id: 'resiliencia',
    name: 'Resiliência',
    description: 'Cofres invisíveis para blindagem familiar. (Em desenvolvimento)',
    icon: Users,
    color: 'bg-amber-500',
    plan: 'Ultimate',
    needs: [],
    path: '/agentes/resiliencia',
  },
];

const NeedsBadge = ({ type }: { type: string }) => {
  const map: Record<string, { label: string; color: string }> = {
    gemini: { label: 'Gemini API', color: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300' },
    google_search: { label: 'Google Search', color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' },
    firestore: { label: 'Firestore', color: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300' },
    none_function: { label: 'Cloud Function', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  };
  const item = map[type];
  if (!item) return null;
  return (
    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${item.color}`}>
      {item.label}
    </span>
  );
};

const planLevels: PlanLevel[] = ['basic', 'premium', 'plus', 'ultimate'];

type Tab = 'overview' | 'users' | 'tickets' | 'agents';

const AdminPanel: React.FC = () => {
  const { logout, user: adminUser } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Agents config state
  const [agentsConfig, setAgentsConfig] = useState<AgentsConfig>(DEFAULT_CONFIG);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const isAdmin = adminUser?.role === 'admin';

  const fetchData = useCallback(async () => {
    if (!isAdmin) { setLoading(false); return; }
    try {
      const snap = await getDocs(query(collection(db, 'users')));
      setUsers(snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile)));
    } catch (e) { console.error(e); }
    try {
      const snap = await getDocs(query(collection(db, 'support_tickets')));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket));
      setTickets(list.sort((a, b) => {
        const aTime = (a.createdAt as unknown as { seconds?: number })?.seconds || 0;
        const bTime = (b.createdAt as unknown as { seconds?: number })?.seconds || 0;
        return bTime - aTime;
      }));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [isAdmin]);

  const loadAgentsConfig = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingConfig(true);
    try {
      const snap = await getDoc(doc(db, 'config', 'agents'));
      if (snap.exists()) {
        const data = snap.data() as AgentsConfig;
        setAgentsConfig({ ...DEFAULT_CONFIG, ...data, enabled: { ...DEFAULT_CONFIG.enabled, ...data.enabled } });
        setGeminiKeyInput(data.geminiApiKey || '');
      }
    } catch (e) { console.error(e); }
    setLoadingConfig(false);
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (activeTab === 'agents') loadAgentsConfig(); }, [activeTab, loadAgentsConfig]);

  const saveAgentsConfig = async () => {
    setIsSavingConfig(true);
    try {
      const newConfig: AgentsConfig = { ...agentsConfig, geminiApiKey: geminiKeyInput };
      await setDoc(doc(db, 'config', 'agents'), newConfig);
      setAgentsConfig(newConfig);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2500);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar. Verifique as regras do Firestore para config/agents.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const toggleAgent = async (id: string) => {
    const updated = { ...agentsConfig, enabled: { ...agentsConfig.enabled, [id]: !agentsConfig.enabled[id] } };
    setAgentsConfig(updated);
    try {
      await setDoc(doc(db, 'config', 'agents'), updated);
    } catch (e) { console.error(e); }
  };

  const updatePlan = async (userId: string, newPlan: PlanLevel) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', userId), { plan: newPlan });
      await fetchData();
    } catch (e) { alert('Erro ao atualizar plano.'); setLoading(false); }
  };

  const toggleAdminRole = async (userId: string, currentRole?: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`${newRole === 'admin' ? 'Promover a Admin?' : 'Remover Admin?'}`)) return;
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      await fetchData();
    } catch (e) { alert('Erro ao atualizar cargo.'); setLoading(false); }
  };

  const deleteTicket = async (id: string) => {
    if (!window.confirm('Resolver e remover este reporte?')) return;
    try {
      await deleteDoc(doc(db, 'support_tickets', id));
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (e) { alert('Erro ao remover ticket.'); }
  };

  const filteredUsers = users.filter(u =>
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const geminiConfigured = !!(agentsConfig.geminiApiKey);
  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.plan !== 'basic').length;

  if (!isAdmin && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC] dark:bg-slate-950">
        <ShieldAlert size={56} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold dark:text-white mb-2">Acesso Restrito</h1>
        <p className="text-slate-500 mb-6">Você não possui permissão de administrador.</p>
        <button onClick={logout} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold">
          <LogOut size={16} /> Sair
        </button>
      </div>
    );
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={16} /> },
    { id: 'users', label: 'Usuários', icon: <Users size={16} /> },
    { id: 'tickets', label: 'Reportes', icon: <MessageSquare size={16} /> },
    { id: 'agents', label: 'Agentes', icon: <Bot size={16} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="p-1.5 bg-red-600 rounded-lg"><ShieldAlert size={16} className="text-white" /></div>
            <span className="font-black text-lg">Admin<span className="text-red-600">IA</span></span>
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOPBAR MOBILE */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <span className="font-black text-lg">Admin<span className="text-red-600">IA</span></span>
          <div className="flex gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-2 rounded-lg transition-colors ${activeTab === item.id ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-400'}`}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            <div className="hidden md:block">
              <h1 className="text-2xl font-black">Olá, {adminUser?.displayName?.split(' ')[0] || 'Admin'}</h1>
              <p className="text-slate-400 text-sm mt-0.5">Gestão global do ecossistema Akumol.</p>
            </div>

            {loading && activeTab !== 'agents' ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* ── OVERVIEW ── */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                    <div className="col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total de Usuários</p>
                      <p className="text-4xl font-black">{totalUsers}</p>
                    </div>
                    <div className="col-span-2 bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                      <p className="text-[10px] font-black uppercase text-indigo-200 tracking-widest mb-1">Usuários Premium</p>
                      <p className="text-4xl font-black">{premiumUsers}</p>
                    </div>
                    <div className="col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Tickets Abertos</p>
                      <p className="text-4xl font-black">{tickets.filter(t => t.status === 'open').length}</p>
                    </div>
                    <div className={`col-span-2 p-6 rounded-3xl border ${geminiConfigured ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${geminiConfigured ? 'text-emerald-500' : 'text-amber-500'}`}>
                        Gemini API
                      </p>
                      <p className={`text-lg font-black ${geminiConfigured ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {geminiConfigured ? '✅ Configurado' : '⚠️ Não configurado'}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── USERS ── */}
                {activeTab === 'users' && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-lg font-black">Usuários ({filteredUsers.length})</h2>
                      <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar..."
                          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm focus:ring-2 ring-indigo-500"
                        />
                        {searchTerm && (
                          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-400">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredUsers.map(u => (
                            <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-sm">{u.displayName || 'Sem Nome'}</p>
                                  {u.role === 'admin' && (
                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 rounded-full text-[9px] font-black uppercase">Admin</span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400">{u.email}</p>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {planLevels.map(p => (
                                    <button
                                      key={p}
                                      onClick={() => updatePlan(u.uid!, p)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${
                                        u.plan === p
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600'
                                      }`}
                                    >
                                      {p}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => toggleAdminRole(u.uid!, u.role)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all border ${
                                      u.role === 'admin'
                                        ? 'bg-red-600 text-white border-red-600'
                                        : 'text-red-500 border-red-300 dark:border-red-800 hover:bg-red-500 hover:text-white'
                                    }`}
                                  >
                                    {u.role === 'admin' ? '- Admin' : '+ Admin'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredUsers.length === 0 && (
                            <tr><td colSpan={2} className="p-10 text-center text-slate-400 text-sm">Nenhum usuário encontrado.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── TICKETS ── */}
                {activeTab === 'tickets' && (
                  <div className="space-y-3 animate-in fade-in">
                    {tickets.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-400 text-sm">Nenhum reporte no momento.</p>
                      </div>
                    ) : tickets.map(t => (
                      <div key={t.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 shadow-sm">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              t.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-500/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20'
                            }`}>
                              {t.type === 'error' ? 'Erro' : 'Sugestão'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {(t.createdAt as unknown as { toDate?: () => Date })?.toDate?.().toLocaleDateString('pt-BR') ?? 'Recente'}
                            </span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                            <p className="text-sm italic text-slate-700 dark:text-slate-300">"{t.message}"</p>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {t.userName || 'Anônimo'} · {t.userEmail || '—'}
                          </p>
                        </div>
                        <button
                          onClick={() => t.id && deleteTicket(t.id)}
                          className="self-start p-3 text-slate-300 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-2xl transition-all"
                          title="Resolver"
                        >
                          <ShieldCheck size={22} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── AGENTS ── */}
                {activeTab === 'agents' && (
                  <div className="space-y-6 animate-in fade-in">

                    {loadingConfig ? (
                      <div className="flex justify-center py-12">
                        <RefreshCw size={24} className="animate-spin text-indigo-500" />
                      </div>
                    ) : (
                      <>
                        {/* CHAVE GLOBAL GEMINI */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
                              <KeyRound size={20} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h2 className="font-black text-slate-800 dark:text-white">Chave Global Gemini</h2>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Usada como fallback quando o usuário não tem chave própria configurada.
                              </p>
                            </div>
                            {geminiConfigured
                              ? <CheckCircle2 size={18} className="text-emerald-500 ml-auto shrink-0" />
                              : <AlertCircle size={18} className="text-amber-500 ml-auto shrink-0" />
                            }
                          </div>

                          <div className="flex gap-3">
                            <div className="relative flex-1">
                              <input
                                type={showKey ? 'text' : 'password'}
                                value={geminiKeyInput}
                                onChange={(e) => setGeminiKeyInput(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 ring-purple-500 transition-all pr-12"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                              >
                                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                            <button
                              onClick={saveAgentsConfig}
                              disabled={isSavingConfig}
                              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shrink-0 ${
                                configSaved
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                              } disabled:opacity-60`}
                            >
                              {isSavingConfig
                                ? <RefreshCw size={16} className="animate-spin" />
                                : configSaved
                                  ? <CheckCircle2 size={16} />
                                  : <Save size={16} />
                              }
                              {configSaved ? 'Salvo!' : 'Salvar'}
                            </button>
                          </div>

                          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-start gap-2">
                            <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                              <strong>Segurança:</strong> Para proteger esta chave, adicione a regra no Firestore:
                              <code className="ml-1 px-1 bg-amber-100 dark:bg-amber-500/20 rounded font-mono">
                                allow read, write: if request.auth.token.role == 'admin';
                              </code>
                            </p>
                          </div>
                        </div>

                        {/* GRID DE AGENTES */}
                        <div>
                          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                            <Bot size={14} /> Agentes ({AGENTS_INFO.length})
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {AGENTS_INFO.map((agent) => {
                              const isEnabled = agentsConfig.enabled[agent.id] ?? false;
                              const AgentIcon = agent.icon;
                              const needsGemini = agent.needs.includes('gemini');
                              const ready = !needsGemini || geminiConfigured;

                              return (
                                <div
                                  key={agent.id}
                                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 transition-all ${
                                    isEnabled
                                      ? 'border-slate-100 dark:border-slate-800 shadow-sm'
                                      : 'border-slate-100 dark:border-slate-800 opacity-60'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2.5 rounded-xl ${agent.color}`}>
                                        <AgentIcon size={18} className="text-white" />
                                      </div>
                                      <div>
                                        <h3 className="font-black text-slate-800 dark:text-white text-sm">{agent.name}</h3>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{agent.plan}</span>
                                      </div>
                                    </div>

                                    {/* Toggle ativo/inativo */}
                                    <button
                                      onClick={() => toggleAgent(agent.id)}
                                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                        isEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                      }`}
                                      title={isEnabled ? 'Desativar' : 'Ativar'}
                                    >
                                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out mt-0.5 ${
                                        isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                      }`} />
                                    </button>
                                  </div>

                                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                                    {agent.description}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {agent.needs.length === 0 ? (
                                      <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 size={10} /> Sem dependências
                                      </span>
                                    ) : (
                                      agent.needs.map(n => <NeedsBadge key={n} type={n} />)
                                    )}

                                    {/* Status da chave Gemini */}
                                    {needsGemini && (
                                      <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ml-auto ${
                                        geminiConfigured
                                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                          : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
                                      }`}>
                                        {geminiConfigured
                                          ? <><CheckCircle2 size={10} /> API OK</>
                                          : <><Circle size={10} /> Sem chave</>
                                        }
                                      </span>
                                    )}

                                    {!needsGemini && ready && (
                                      <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full ml-auto">
                                        <CheckCircle2 size={10} /> Pronto
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* CLOUD FUNCTIONS INFO */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                          <h2 className="font-black text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                            <Zap size={16} className="text-amber-500" /> Cloud Functions
                          </h2>
                          <p className="text-xs text-slate-400 mb-4">
                            Funções implantadas no Firebase Functions. Deploy via <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono">firebase deploy --only functions</code>
                          </p>
                          <div className="space-y-2">
                            {[
                              { name: 'askCounselor', desc: 'Chat do Conselheiro via Gemini (server-side)', needs: 'GEMINI_API_KEY no .env das Functions' },
                              { name: 'updateBalance', desc: 'Depósitos e retiradas de saldo', needs: 'Nenhuma chave externa' },
                            ].map(fn => (
                              <div key={fn.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div>
                                  <p className="text-sm font-bold dark:text-white font-mono">{fn.name}</p>
                                  <p className="text-xs text-slate-400">{fn.desc}</p>
                                  <p className="text-[10px] text-amber-500 font-bold mt-0.5">Requer: {fn.needs}</p>
                                </div>
                                <span className="text-[9px] font-black uppercase px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full shrink-0">
                                  Functions
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
