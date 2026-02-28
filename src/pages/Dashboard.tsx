import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ShieldCheck, Zap, TrendingUp, Users, LogOut, 
  ArrowUpRight, Sun, Moon, Target, 
  Clock, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { doc, setDoc, onSnapshot, collection, query, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase';

type Period = 'yesterday' | 'lastWeek' | 'lastMonth' | 'sixMonths' | 'lastYear';

const SentinelaWidget = ({ hourlyRate }: { hourlyRate: number }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ price: number; lifeHours: number } | null>(null);

  const analisarCompra = () => {
    if (!url) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const precoSimulado = Math.floor(Math.random() * 500) + 100; 
      setAnalysis({ price: precoSimulado, lifeHours: parseFloat((precoSimulado / hourlyRate).toFixed(1)) });
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="bg-indigo-600 dark:bg-indigo-900/80 p-6 md:p-8 rounded-[2.5rem] text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-indigo-200" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Agente Sentinela</span>
        </div>
      </div>
      {!analysis ? (
        <>
          <p className="text-xl font-bold leading-tight">Filtro de 72h</p>
          <div className="mt-6 flex gap-2">
            <input 
              type="text" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="Link do produto..." 
              className="w-full bg-indigo-500/50 rounded-xl px-4 py-3 text-sm outline-none" 
            />
            <button onClick={analisarCompra} className="bg-white text-indigo-600 p-4 rounded-xl">
              {isAnalyzing ? <Clock size={20} className="animate-spin" /> : <ArrowUpRight size={20} />}
            </button>
          </div>
        </>
      ) : (
        <div className="animate-in fade-in">
          <h2 className="text-3xl font-black">{analysis.lifeHours}h de Vida</h2>
          <p className="text-xs text-indigo-200 mt-2">Isso custa {analysis.price} BRL do seu tempo.</p>
          <button onClick={() => {setAnalysis(null); setUrl('')}} className="mt-4 w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm">Bloquear por 72h</button>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  const [financialData, setFinancialData] = useState<any>(null);
  const [globalSavings, setGlobalSavings] = useState(0); 
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('lastMonth');
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) setFinancialData(doc.data().financialData);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const fetchGlobalData = async () => {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      let total = 0;
      querySnapshot.forEach((doc) => {
        total += doc.data().financialData?.totalSaved || 0;
      });
      setGlobalSavings(total);
    };
    fetchGlobalData();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const assinaturasParaCortar = useMemo(() => {
    const subs = financialData?.subscriptions || [];
    return subs.filter((s: any) => s.statusUso === 'baixo');
  }, [financialData]);

  const totalVazamentos = useMemo(() => {
    return assinaturasParaCortar.reduce((acc: number, curr: any) => acc + curr.valor, 0);
  }, [assinaturasParaCortar]);

  const handleTransaction = async (type: 'deposit' | 'withdraw') => {
    const amount = parseFloat(inputValue.replace(',', '.'));
    if (isNaN(amount) || amount <= 0 || !user?.uid) return;
    if (type === 'withdraw' && amount > (financialData?.balance || 0)) return alert("Saldo insuficiente");

    setIsProcessing(true);
    const newBalance = type === 'deposit' ? (financialData?.balance || 0) + amount : (financialData?.balance || 0) - amount;

    try {
      await setDoc(doc(db, 'users', user.uid), {
        financialData: { balance: newBalance }
      }, { merge: true });
      setShowDepositModal(false);
      setShowWithdrawModal(false);
      setInputValue('');
    } catch (e) {
      alert("Erro na transação" + e);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const patrimonioTotal = (financialData?.balance || 0) + (financialData?.totalInvested || 0);
  const hourlyRate = (financialData?.salary || 3000) / 160;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      {/* ALTERAÇÃO: Removido mb-10 e adicionado mb-4 para aproximar o conteúdo */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white">Olá, {user?.displayName?.split(' ')[0]}</h1>
          <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-1 rounded uppercase tracking-widest">Plano {user?.plan?.toUpperCase()}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {isDarkMode ? <Sun size={20} className="text-white"/> : <Moon size={20} />}
          </button>
          <button onClick={logout} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-red-500">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* ALTERAÇÃO: Reduzido o espaçamento vertical entre o header e o main */}
      <main className="max-w-7xl mx-auto space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
               <div>
                 <p className="text-[10px] font-black uppercase text-slate-400">Património Total</p>
                 <h2 className="text-4xl md:text-5xl font-black dark:text-white tracking-tighter mt-1">{formatCurrency(patrimonioTotal)}</h2>
               </div>
               <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as Period)} className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold p-2 rounded-full outline-none dark:text-white">
                  <option value="lastMonth">Este Mês</option>
                  <option value="lastYear">Este Ano</option>
               </select>
            </div>
            <div className="mt-8 flex gap-3 relative z-10">
              <button onClick={() => setShowDepositModal(true)} className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold active:scale-95 transition-all">Gerir Saldo</button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Saldo em Conta</p>
            <h2 className="text-3xl font-black dark:text-white">{formatCurrency(financialData?.balance)}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4 text-red-500">
                <Zap size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Agente Sombra</span>
              </div>
              <h2 className="text-slate-800 dark:text-white font-black text-2xl">Vazamentos Detectados</h2>
              <p className="text-5xl font-black text-red-500 mt-2">
                {formatCurrency(totalVazamentos)}
              </p>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                <p className="text-xs text-slate-400">
                  {assinaturasParaCortar.length > 0 
                    ? `Identificamos ${assinaturasParaCortar.length} assinaturas que você está gastando.`
                    : "Sua conta está blindada. Nenhum vazamento detectado."}
                </p>
                <button 
                  onClick={() => navigate('/agentes/sombra')}
                  className="bg-red-500 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-lg shadow-red-500/30 active:scale-95 transition-all"
                >
                  Exterminar Gastos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <Target className="text-green-500 mb-4" />
                <h3 className="font-bold text-slate-400 text-xs uppercase">Horas de Vida Salvas</h3>
                <p className="text-3xl font-black dark:text-white">{financialData?.hoursSaved || 0}h</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <TrendingUp className="text-emerald-500 mb-4" />
                <h3 className="font-bold text-slate-400 text-xs uppercase">Rendimento Yu’e Bao</h3>
                <p className="text-3xl font-black dark:text-white">{formatCurrency(financialData?.dailyYield || 1.25)}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <SentinelaWidget hourlyRate={hourlyRate} />
            <div className="bg-linear-to-br from-amber-400 to-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4"><Users size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Missão de Equipa</span></div>
              <h3 className="text-2xl font-bold">Economia Global</h3>
              <p className="text-4xl font-black mt-2">{formatCurrency(globalSavings)}</p>
              <p className="text-xs text-white/80 mt-2">Total salvo pela comunidade Akumol.</p>
            </div>
          </div>
        </div>
      </main>

      {(showDepositModal || showWithdrawModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black dark:text-white">Gerir Saldo</h3>
              <button onClick={() => {setShowDepositModal(false); setShowWithdrawModal(false)}}><X className="text-slate-400" /></button>
            </div>
            <input 
              type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              placeholder="0,00" className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-2xl font-black outline-none mb-6 dark:text-white" 
            />
            <div className="flex gap-3">
              <button onClick={() => handleTransaction('withdraw')} disabled={isProcessing} className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl font-bold text-slate-600 dark:text-slate-300">Retirar</button>
              <button onClick={() => handleTransaction('deposit')} disabled={isProcessing} className="flex-1 bg-indigo-600 text-white p-4 rounded-xl font-bold">Depositar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;