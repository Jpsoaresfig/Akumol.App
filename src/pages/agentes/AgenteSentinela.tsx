import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronLeft, Plus, Clock, Lock, Unlock, Trash2, AlertOctagon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../api/firebase';
import { addDoc, deleteDoc, doc, collection, orderBy } from 'firebase/firestore';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';

interface CompraImpulso {
  id: string;
  produto: string;
  valor: number;
  link: string;
  dataAdicao: number;
}

const TEMPO_BLOQUEIO_MS = 72 * 60 * 60 * 1000;

const AgenteSentinela: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: compras, loading } = useFirestoreCollection<CompraImpulso>('users', user?.uid || '--', 'quarantine', orderBy('dataAdicao', 'desc'));

  const [valorHora, setValorHora] = useState<number>(25);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());
  const [showAdd, setShowAdd] = useState(false);
  const [novoProduto, setNovoProduto] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoLink, setNovoLink] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const adicionarCompra = async () => {
    if (!novoProduto.trim()) { setErro('Informe o nome do produto.'); return; }
    const valorFormatado = parseFloat(novoValor.replace(',', '.'));
    if (isNaN(valorFormatado) || valorFormatado <= 0) { setErro('Insira um valor válido.'); return; }
    if (!user?.uid) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'quarantine'), {
        produto: novoProduto.trim(),
        valor: valorFormatado,
        link: novoLink.trim() || '',
        dataAdicao: Date.now(),
      });
      fecharModal();
    } catch {
      setErro('Erro ao salvar. Tente novamente.');
    }
  };

  const removerCompra = async (id: string) => {
    if (!user?.uid) return;
    await deleteDoc(doc(db, 'users', user.uid, 'quarantine', id));
  };

  const fecharModal = () => {
    setShowAdd(false);
    setNovoProduto('');
    setNovoValor('');
    setNovoLink('');
    setErro('');
  };

  const getStatusBloqueio = (dataAdicao: number) => {
    const tempoRestante = TEMPO_BLOQUEIO_MS - (currentTime - dataAdicao);
    if (tempoRestante <= 0) return { bloqueado: false, texto: 'Liberado para compra' };
    const horasRestantes = Math.floor(tempoRestante / (1000 * 60 * 60));
    return { bloqueado: true, texto: `Bloqueado por mais ${horasRestantes}h` };
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin text-amber-500" size={36} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate('/agentes')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Voltar
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
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Agente Sentinela</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Filtro de 72h contra compras por impulso.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-indigo-500" /> Quanto vale sua hora?
          </h3>
          <p className="text-xs text-slate-500 mt-1">Converte preços em horas de vida.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
          <span className="text-slate-500 font-bold pl-2">R$</span>
          <input
            type="number"
            value={valorHora}
            onChange={(e) => setValorHora(Number(e.target.value))}
            className="bg-transparent w-20 outline-none font-bold text-slate-800 dark:text-white"
          />
          <span className="text-slate-500 font-bold pr-2">/h</span>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-2xl flex gap-3">
        <AlertOctagon className="text-amber-600 shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Qualquer compra adicionada aqui sofre uma <strong>quarentena de 72 horas</strong>. Se ainda quiser depois, o Sentinela libera.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">
          Fila de Quarentena ({compras.length})
        </h3>

        {compras.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <ShieldCheck size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Sua mente está livre de impulsos no momento.</p>
          </div>
        )}

        {compras.map((item) => {
          const { bloqueado, texto } = getStatusBloqueio(item.dataAdicao);
          const horasDeVida = (item.valor / (valorHora || 1)).toFixed(1);
          return (
            <div key={item.id} className={`p-5 rounded-2xl border transition-all ${
              bloqueado
                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900 shadow-sm'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">{item.produto}</h4>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button onClick={() => removerCompra(item.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 p-3 rounded-xl text-sm font-medium flex items-center gap-2 mb-4">
                <Clock size={16} />
                Isso vai custar <strong>{horasDeVida} horas</strong> de trabalho da sua vida.
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className={`flex items-center gap-2 text-sm font-bold ${bloqueado ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {bloqueado ? <Lock size={16} /> : <Unlock size={16} />}
                  {texto}
                </div>
                <button
                  disabled={bloqueado || !item.link}
                  onClick={() => item.link && window.open(item.link, '_blank', 'noopener,noreferrer')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    bloqueado || !item.link
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none cursor-pointer'
                  }`}
                >
                  ACESSAR CHECKOUT
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-black mb-1 text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="text-amber-500" /> Interceptar Compra
            </h2>
            <p className="text-sm text-slate-500 mb-5">Coloque esse impulso em quarentena por 72h.</p>

            {erro && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-xl mb-4">{erro}</p>
            )}

            <input
              type="text"
              placeholder="O que você quer comprar?"
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 mb-3 outline-none focus:ring-2 ring-amber-500 dark:text-white text-sm"
              value={novoProduto}
              onChange={(e) => setNovoProduto(e.target.value)}
            />
            <input
              type="text"
              placeholder="Valor (R$)"
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 mb-3 outline-none focus:ring-2 ring-amber-500 dark:text-white text-sm"
              value={novoValor}
              onChange={(e) => setNovoValor(e.target.value)}
            />
            <input
              type="url"
              placeholder="Link do Checkout (opcional)"
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 mb-5 outline-none focus:ring-2 ring-amber-500 dark:text-white text-sm"
              value={novoLink}
              onChange={(e) => setNovoLink(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={fecharModal} className="flex-1 p-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm">
                Cancelar
              </button>
              <button onClick={adicionarCompra} className="flex-1 bg-amber-500 hover:bg-amber-600 p-3 rounded-xl text-white font-bold transition-colors text-sm active:scale-95">
                Bloquear 72h
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenteSentinela;
