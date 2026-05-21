import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, Plus, Trash2, ShieldCheck, Loader2, Vault, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../api/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';

interface Cofre {
  id: string;
  nome: string;
  objetivo: number;
  atual: number;
  tipo: 'emergencia' | 'saude' | 'educacao' | 'outro';
  createdAt: number;
}

const tipoConfig = {
  emergencia: { label: 'Emergência', color: 'bg-red-500', badge: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300' },
  saude:      { label: 'Saúde',      color: 'bg-blue-500', badge: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' },
  educacao:   { label: 'Educação',   color: 'bg-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
  outro:      { label: 'Outro',      color: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' },
};

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const AgenteResiliencia: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cofres, setCofres] = useState<Cofre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [nome, setNome] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [tipo, setTipo] = useState<Cofre['tipo']>('emergencia');
  const [erro, setErro] = useState('');
  const [aportando, setAportando] = useState<string | null>(null);
  const [valorAporte, setValorAporte] = useState('');

  const gastosMensais = user?.financialData?.monthlyExpenses || 0;
  const totalGuardado = cofres.reduce((s, c) => s + c.atual, 0);
  const mesesCobertura = gastosMensais > 0 ? totalGuardado / gastosMensais : 0;

  const scoreResiliencia = Math.min(100, Math.round(
    (Math.min(mesesCobertura / 6, 1) * 60) +
    (Math.min(cofres.length / 3, 1) * 40)
  ));

  useEffect(() => {
    if (!user?.uid) return;
    const ref = collection(db, 'users', user.uid, 'vaults');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCofres(snap.docs.map(d => ({ id: d.id, ...d.data() } as Cofre)));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleAddCofre = async () => {
    if (!nome.trim()) { setErro('Informe o nome do cofre.'); return; }
    const obj = parseFloat(objetivo.replace(',', '.'));
    if (isNaN(obj) || obj <= 0) { setErro('Informe um objetivo válido.'); return; }
    if (!user?.uid) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'vaults'), {
        nome: nome.trim(),
        objetivo: obj,
        atual: 0,
        tipo,
        createdAt: Date.now(),
      });
      setNome(''); setObjetivo(''); setTipo('emergencia'); setErro('');
      setShowAdd(false);
    } catch { setErro('Erro ao salvar. Tente novamente.'); }
  };

  const handleAporte = async (cofre: Cofre) => {
    const val = parseFloat(valorAporte.replace(',', '.'));
    if (isNaN(val) || val === 0) return;
    if (!user?.uid) return;
    const novoAtual = Math.max(0, cofre.atual + val);
    await updateDoc(doc(db, 'users', user.uid, 'vaults', cofre.id), { atual: novoAtual });
    setAportando(null);
    setValorAporte('');
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    await deleteDoc(doc(db, 'users', user.uid, 'vaults', id));
  };

  const scoreColor = scoreResiliencia >= 70 ? 'text-emerald-500' : scoreResiliencia >= 40 ? 'text-amber-500' : 'text-red-500';
  const scoreLabel = scoreResiliencia >= 70 ? 'Blindado' : scoreResiliencia >= 40 ? 'Em construção' : 'Vulnerável';

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin text-amber-500" size={36} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate('/agentes')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-amber-500 hover:bg-amber-600 p-2.5 rounded-xl text-white shadow-lg shadow-amber-200 dark:shadow-none transition-all active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
          <Users size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Agente Resiliência</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Cofres invisíveis para blindagem familiar.</p>
        </div>
      </div>

      {/* Score + Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Score de Resiliência</p>
          <span className={`text-5xl font-black ${scoreColor}`}>{scoreResiliencia}</span>
          <span className={`text-xs font-bold mt-1 ${scoreColor}`}>{scoreLabel}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Total Guardado</p>
          <span className="text-2xl font-black text-slate-800 dark:text-white">{fmt(totalGuardado)}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Cobertura</p>
          <span className="text-2xl font-black text-slate-800 dark:text-white">{mesesCobertura.toFixed(1)} meses</span>
          <span className="text-[10px] text-slate-400 mt-1">Recomendado: 6 meses</span>
        </div>
      </div>

      {/* Alerta se cobertura < 3 meses */}
      {gastosMensais > 0 && mesesCobertura < 3 && (
        <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-2xl flex gap-3">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-700 dark:text-red-400">
            Sua reserva cobre menos de 3 meses de gastos. Qualquer imprevisto pode comprometer suas finanças.{' '}
            <strong>Priorize o cofre de emergência.</strong>
          </p>
        </div>
      )}

      {/* Cofres */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">
          Seus Cofres ({cofres.length})
        </h3>

        {cofres.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center">
            <ShieldCheck size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-slate-400 text-sm">Nenhum cofre criado ainda.</p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Crie seu primeiro cofre de emergência.</p>
          </div>
        )}

        {cofres.map((cofre) => {
          const cfg = tipoConfig[cofre.tipo];
          const pct = cofre.objetivo > 0 ? Math.min(100, (cofre.atual / cofre.objetivo) * 100) : 0;
          const isAportando = aportando === cofre.id;

          return (
            <div key={cofre.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${cfg.color} text-white`}>
                    <Vault size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white">{cofre.nome}</h4>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(cofre.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>{fmt(cofre.atual)}</span>
                  <span>{fmt(cofre.objetivo)}</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${cfg.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-right text-xs text-slate-400 mt-1">{pct.toFixed(0)}% atingido</p>
              </div>

              {isAportando ? (
                <div className="flex gap-2 mt-3">
                  <input
                    type="number"
                    placeholder="Valor (+ aporte / - retirada)"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ring-amber-500 dark:text-white"
                    value={valorAporte}
                    onChange={(e) => setValorAporte(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={() => handleAporte(cofre)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => { setAportando(null); setValorAporte(''); }}
                    className="text-slate-400 hover:text-slate-600 px-2 py-2 rounded-xl text-xs transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setAportando(cofre.id); setValorAporte(''); }}
                  className="w-full mt-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 py-2 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                >
                  + Aportar / − Retirar
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal novo cofre */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-black mb-1 text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="text-amber-500" /> Novo Cofre
            </h2>
            <p className="text-sm text-slate-500 mb-5">Crie um cofre de proteção financeira.</p>

            {erro && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-xl mb-4">{erro}</p>
            )}

            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nome do cofre</label>
            <input
              type="text"
              placeholder="Ex: Reserva de Emergência"
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 mb-3 outline-none focus:ring-2 ring-amber-500 dark:text-white text-sm"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Objetivo (R$)</label>
            <input
              type="number"
              placeholder="0,00"
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 mb-3 outline-none focus:ring-2 ring-amber-500 dark:text-white text-sm"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />

            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tipo</label>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {(Object.keys(tipoConfig) as Cofre['tipo'][]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    tipo === t
                      ? `${tipoConfig[t].badge} border-transparent`
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {tipoConfig[t].label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowAdd(false); setErro(''); setNome(''); setObjetivo(''); setTipo('emergencia'); }}
                className="flex-1 p-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCofre}
                className="flex-1 bg-amber-500 hover:bg-amber-600 p-3 rounded-xl text-white font-bold transition-colors text-sm active:scale-95"
              >
                Criar Cofre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenteResiliencia;
