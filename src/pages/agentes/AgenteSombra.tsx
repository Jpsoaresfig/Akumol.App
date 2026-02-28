import React, { useState } from 'react';
import { Ghost, ChevronLeft, Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Assinatura {
  id: string;
  nome: string;
  valor: number;
  dataVencimento: string;
  statusUso: 'baixo' | 'normal';
}

const AgenteSombra: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado inicial com as assinaturas
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([
    { id: '1', nome: 'Netflix', valor: 55.90, dataVencimento: '10', statusUso: 'baixo' },
    { id: '2', nome: 'Academia', valor: 110.00, dataVencimento: '15', statusUso: 'normal' }
  ]);
  
  const [showAdd, setShowAdd] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');

  // Encontra se há alguma assinatura com baixo uso para exibir no alerta
  const assinaturaAlerta = assinaturas.find(sub => sub.statusUso === 'baixo');

  // Função para adicionar nova assinatura
  const adicionarAssinatura = () => {
    if (!novoNome || !novoValor) return;
    
    // Converte o valor para número lidando com possível vírgula
    const valorFormatado = parseFloat(novoValor.replace(',', '.'));
    
    if (isNaN(valorFormatado)) {
      alert("Por favor, insira um valor válido.");
      return;
    }

    const nova: Assinatura = {
      id: Math.random().toString(), // Em produção, usar UUID ou ID do banco
      nome: novoNome,
      valor: valorFormatado,
      dataVencimento: '05', // Fixado para exemplo, mas poderia ser um input também
      statusUso: 'normal' as const
    };
    
    setAssinaturas([...assinaturas, nova]);
    setNovoNome('');
    setNovoValor('');
    setShowAdd(false);
  };

  // Função para remover uma assinatura pelo ID
  const removerAssinatura = (id: string) => {
    // Filtra a lista mantendo apenas os que têm ID diferente do selecionado
    const novaLista = assinaturas.filter(sub => sub.id !== id);
    setAssinaturas(novaLista);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black flex items-center gap-2 text-slate-800 dark:text-white">
            <Ghost className="text-indigo-600" /> Agente Sombra
          </h1>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 p-2 rounded-xl text-white hover:bg-indigo-700 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Alerta de Desperdício (Renderizado dinamicamente) */}
      {assinaturaAlerta && (
        <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 mb-8 rounded-r-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-400 font-medium">
              O Agente Sombra detectou que você não utiliza a <strong>{assinaturaAlerta.nome}</strong> há mais de 20 dias. Deseja cancelar?
            </p>
          </div>
          <button 
            onClick={() => removerAssinatura(assinaturaAlerta.id)}
            className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
          >
            SIM, CANCELAR
          </button>
        </div>
      )}

      {/* Lista de Assinaturas */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">Suas Assinaturas Ativas</h3>
        
        {assinaturas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Nenhuma assinatura cadastrada.</p>
        ) : (
          assinaturas.map((sub) => (
            <div key={sub.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${sub.statusUso === 'baixo' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{sub.nome}</p>
                  <p className="text-xs text-slate-400">Vence dia {sub.dataVencimento}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="font-black text-slate-800 dark:text-white flex items-center gap-3">
                  R$ {sub.valor.toFixed(2)}
                  <button 
                    onClick={() => removerAssinatura(sub.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                    title="Remover assinatura"
                  >
                    <Trash2 size={16} />
                  </button>
                </p>
                {sub.statusUso === 'baixo' && (
                  <button 
                    onClick={() => removerAssinatura(sub.id)}
                    className="text-[10px] font-bold text-red-500 uppercase mt-1 hover:underline cursor-pointer"
                  >
                    CORTAR GASTO
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Simples de Adição Manual */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Nova Assinatura</h2>
            <input 
              type="text" placeholder="Nome (ex: Spotify)" 
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4 outline-none focus:ring-2 ring-indigo-500 dark:text-white"
              value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
            />
            <input 
              type="text" placeholder="Valor (R$)" 
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 mb-6 outline-none focus:ring-2 ring-indigo-500 dark:text-white"
              value={novoValor} onChange={(e) => setNovoValor(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 p-4 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={adicionarAssinatura} className="flex-1 bg-indigo-600 p-4 rounded-xl text-white font-bold hover:bg-indigo-700 transition-colors">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenteSombra;