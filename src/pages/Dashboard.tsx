import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Zap, TrendingUp, Users, ArrowUpRight, Target, Clock, X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../api/firebase';

type TransactionType = 'deposit' | 'withdraw';

interface Subscription {
  id?: string;
  nome?: string;
  valor: number;
  statusUso: 'baixo' | 'medio' | 'alto';
}

interface FinancialData {
  balance?: number;
  totalInvested?: number;
  salary?: number;
  hoursSaved?: number;
  dailyYield?: number;
  totalSaved?: number;
  subscriptions?: Subscription[];
}

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
    <div className="bg-indigo-600 dark:bg-indigo-900/80 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-indigo-200" />
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Agente Sentinela</span>
      </div>
      {!analysis ? (
        <>
          <p className="text-lg font-bold leading-tight mb-4">Filtro de 72h</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Link do produto..."
              className="flex-1 bg-indigo-500/50 rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-indigo-300 min-w-0"
            />
            <button
              onClick={analisarCompra}
              className="bg-white text-indigo-600 p-2.5 rounded-xl active:scale-95 transition-all shrink-0"
            >
              {isAnalyzing ? <Clock size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
            </button>
          </div>
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <h2 className="text-3xl font-black">{analysis.lifeHours}h de Vida</h2>
          <p className="text-xs text-indigo-200 mt-1">Custa R$ {analysis.price} do seu tempo.</p>
          <button
            onClick={() => { setAnalysis(null); setUrl(''); }}
            className="mt-4 w-full bg-white text-indigo-600 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors active:scale-95"
          >
            Nova análise
          </button>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [globalSavings, setGlobalSavings] = useState(0);
  const [showModal, setShowModal] = useState<TransactionType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setFinancialData(snap.data().financialData as FinancialData);
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system', 'globalStats'), (snap) => {
      if (snap.exists()) setGlobalSavings(snap.data().totalSaved || 0);
    });
    return () => unsub();
  }, []);

  const assinaturasParaCortar = useMemo(() => {
    return (financialData?.subscriptions || []).filter((s) => s.statusUso === 'baixo');
  }, [financialData]);

  const totalVazamentos = useMemo(() => {
    return assinaturasParaCortar.reduce((acc, curr) => acc + curr.valor, 0);
  }, [assinaturasParaCortar]);

  const handleTransaction = async (type: TransactionType) => {
    const amount = parseFloat(inputValue.replace(',', '.'));
    if (isNaN(amount) || amount <= 0 || !user?.uid) return;
    setIsProcessing(true);
    try {
      const fn = httpsCallable(functions, 'updateBalance');
      await fn({ amount, type });
      setShowModal(null);
      setInputValue('');
    } catch (error: unknown) {
      const e = error as Error;
      alert('Erro na transação: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const patrimonioTotal = (financialData?.balance || 0) + (financialData?.totalInvested || 0);
  const hourlyRate = (financialData?.salary || 3000) / 160;

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-6">

      {/* SAUDAÇÃO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-xl md:text-2xl font-black dark:text-white">
            Olá, {user?.displayName?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Aqui está o resumo do seu patrimônio.</p>
        </div>
        <span className="w-fit text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-full uppercase tracking-widest">
          Plano {user?.plan?.toUpperCase()}
        </span>
      </div>

      {/* CARDS TOPO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Patrimônio total */}
        <div className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Patrimônio Total</p>
          <h2 className="text-3xl md:text-4xl font-black dark:text-white tracking-tighter">{fmt(patrimonioTotal)}</h2>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => setShowModal('deposit')}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={16} /> Depositar
            </button>
            <button
              onClick={() => setShowModal('withdraw')}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all"
            >
              <Minus size={16} /> Retirar
            </button>
          </div>
        </div>

        {/* Saldo em conta */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Saldo em Conta</p>
          <h2 className="text-2xl md:text-3xl font-black dark:text-white">{fmt(financialData?.balance || 0)}</h2>
          <div className="mt-4 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700"
              style={{ width: patrimonioTotal > 0 ? `${Math.min(100, ((financialData?.balance || 0) / patrimonioTotal) * 100)}%` : '0%' }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {patrimonioTotal > 0 ? `${(((financialData?.balance || 0) / patrimonioTotal) * 100).toFixed(0)}% do patrimônio` : 'Sem dados'}
          </p>
        </div>
      </div>

      {/* LINHA DO MEIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Vazamentos */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-red-500">
            <Zap size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Agente Sombra</span>
          </div>
          <h2 className="text-slate-800 dark:text-white font-black text-xl">Vazamentos Detectados</h2>
          <p className="text-4xl font-black text-red-500 mt-1">{fmt(totalVazamentos)}</p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-5">
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {assinaturasParaCortar.length > 0
                ? `${assinaturasParaCortar.length} assinaturas com baixo uso identificadas.`
                : 'Nenhum vazamento detectado. Conta blindada.'}
            </p>
            <button
              onClick={() => navigate('/agentes/sombra')}
              className="shrink-0 bg-red-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-lg shadow-red-500/30 active:scale-95 transition-all"
            >
              Exterminar Gastos
            </button>
          </div>
        </div>

        {/* Métricas */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
            <Target className="text-green-500 mb-3" size={20} />
            <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Horas Salvas</p>
            <p className="text-2xl font-black dark:text-white">{financialData?.hoursSaved || 0}h</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
            <TrendingUp className="text-emerald-500 mb-3" size={20} />
            <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Rendimento</p>
            <p className="text-2xl font-black dark:text-white">{fmt(financialData?.dailyYield || 0)}</p>
          </div>
        </div>
      </div>

      {/* LINHA INFERIOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SentinelaWidget hourlyRate={hourlyRate} />
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-3xl text-white shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-100">Missão de Equipe</span>
          </div>
          <h3 className="text-lg font-bold">Economia Global</h3>
          <p className="text-3xl font-black mt-1">{fmt(globalSavings)}</p>
          <p className="text-xs text-amber-100/80 mt-2 leading-relaxed">
            Patrimônio coletivo salvo pela comunidade Akumol.
          </p>
        </div>
      </div>

      {/* MODAL TRANSAÇÃO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
                {showModal === 'deposit' ? <Plus size={20} className="text-indigo-500" /> : <Minus size={20} className="text-slate-500" />}
                {showModal === 'deposit' ? 'Depositar' : 'Retirar'}
              </h3>
              <button
                onClick={() => { setShowModal(null); setInputValue(''); }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Valor (R$)</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0,00"
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-2xl font-black outline-none focus:ring-2 ring-indigo-500 transition-all dark:text-white"
              />
            </div>
            <button
              onClick={() => handleTransaction(showModal)}
              disabled={isProcessing || !inputValue}
              className={`w-full p-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50 ${
                showModal === 'deposit'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                  : 'bg-slate-800 dark:bg-slate-700 text-white'
              }`}
            >
              {isProcessing ? 'Processando...' : showModal === 'deposit' ? 'Confirmar Depósito' : 'Confirmar Retirada'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
