import React, { useState, useEffect } from 'react';
import { Ghost, ChevronLeft, Plus, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../api/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

interface Assinatura {
  id: string;
  nome: string;
  valor: number;
  dataVencimento: string;
  statusUso: 'baixo' | 'normal';
}

const AgenteSombra: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');

  // Sincronização em tempo real com o Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setAssinaturas(data.financialData?.subscriptions || []);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const adicionarAssinatura = async () => {
    if (!novoNome || !novoValor || !user?.uid) return;
    
    const valorNum = parseFloat(novoValor.replace(',', '.'));
    if (isNaN(valorNum)) return alert("Valor inválido");

    const nova: Assinatura = {
      // eslint-disable-next-line react-hooks/purity
      id: Date.now().toString(),
      nome: novoNome,
      valor: valorNum,
      dataVencimento: new Date().getDate().toString().padStart(2, '0'),
      // Definimos como 'baixo' se for um valor pequeno ou mockamos a lógica de uso
      statusUso: valorNum < 60 ? 'baixo' : 'normal' 
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'financialData.subscriptions': [...assinaturas, nova]
      });
      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const removerAssinatura = async (id: string) => {
    if (!user?.uid) return;
    try {
      const novaLista = assinaturas.filter(s => s.id !== id);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'financialData.subscriptions': novaLista
      });
    } catch (error) {
      console.error("Erro ao remover:", error);
    }
  };

  const fecharModal = () => {
    setShowAdd(false);
    setNovoNome('');
    setNovoValor('');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  const assinaturaAlerta = assinaturas.find(s => s.statusUso === 'baixo');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pb-24 lg:pb-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm"><ChevronLeft size={20} /></button>
            <h1 className="text-2xl font-black flex items-center gap-2 text-slate-800 dark:text-white">
              <Ghost className="text-indigo-600" /> Agente Sombra
            </h1>
          </div>
          <button onClick={() => setShowAdd(true)} className="bg-indigo-600 p-2 rounded-xl text-white hover:bg-indigo-700 transition-all"><Plus size={24} /></button>
        </header>

        {assinaturaAlerta && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-8 rounded-r-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" />
              <p className="text-sm text-red-800 dark:text-red-400 font-medium">O Agente detectou baixo uso na <strong>{assinaturaAlerta.nome}</strong>. Deseja cancelar?</p>
            </div>
            <button onClick={() => removerAssinatura(assinaturaAlerta.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700">CANCELAR AGORA</button>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest px-2">Suas Assinaturas Ativas</h3>
          {assinaturas.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-4xl text-slate-400">Nenhuma assinatura monitorada.</div>
          ) : (
            assinaturas.map((sub) => (
              <div key={sub.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${sub.statusUso === 'baixo' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{sub.nome}</p>
                    <p className="text-xs text-slate-400">Vence dia {sub.dataVencimento}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-slate-800 dark:text-white">R$ {sub.valor.toFixed(2)}</p>
                    {sub.statusUso === 'baixo' && <span className="text-[10px] text-red-500 font-bold uppercase">Baixo Uso</span>}
                  </div>
                  <button onClick={() => removerAssinatura(sub.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-black mb-6 dark:text-white">Nova Assinatura</h2>
            <input type="text" placeholder="Nome (ex: Netflix)" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4 outline-none dark:text-white" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
            <input type="number" placeholder="Valor (R$)" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 mb-6 outline-none dark:text-white" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={fecharModal} className="flex-1 p-4 font-bold text-slate-400">Cancelar</button>
              <button onClick={adicionarAssinatura} className="flex-1 bg-indigo-600 p-4 rounded-xl text-white font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenteSombra;