import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronLeft, Plus, Clock, Lock, Unlock, Trash2, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompraImpulso {
  id: string;
  produto: string;
  valor: number;
  link: string;
  dataAdicao: number;
}

const AgenteSentinela: React.FC = () => {
  const navigate = useNavigate();
  
  const [valorHora, setValorHora] = useState<number>(25);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  // CORREÇÃO AQUI: Passamos uma função ()=>[] para o useState
  const [compras, setCompras] = useState<CompraImpulso[]>(() => [
    {
      id: '1',
      produto: 'Tênis de Corrida Novo',
      valor: 899.90,
      link: 'https://loja.com/tenis',
      dataAdicao: Date.now() - (10 * 60 * 60 * 1000), // Há 10 horas
    },
    {
      id: '2',
      produto: 'Curso de Finanças',
      valor: 297.00,
      link: 'https://loja.com/curso',
      dataAdicao: Date.now() - (80 * 60 * 60 * 1000), // Há 80 horas
    }
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [novoProduto, setNovoProduto] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoLink, setNovoLink] = useState('');

  const TEMPO_BLOQUEIO_MS = 72 * 60 * 60 * 1000; // 72 horas em milissegundos

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const adicionarCompra = () => {
    if (!novoProduto || !novoValor) return;
    
    const valorFormatado = parseFloat(novoValor.replace(',', '.'));
    if (isNaN(valorFormatado)) return alert("Insira um valor válido.");

    const nova: CompraImpulso = {
      // eslint-disable-next-line react-hooks/purity
      id: Date.now().toString(),
      produto: novoProduto,
      valor: valorFormatado,
      link: novoLink || '#',
      // eslint-disable-next-line react-hooks/purity
      dataAdicao: Date.now(),
    };

    setCompras(prev => [nova, ...prev]);
    fecharModal();
  };

  const removerCompra = (id: string) => {
    setCompras(prev => prev.filter(c => c.id !== id));
  };

  const fecharModal = () => {
    setShowAdd(false);
    setNovoProduto('');
    setNovoValor('');
    setNovoLink('');
  };

  const getStatusBloqueio = (dataAdicao: number) => {
    const tempoPassado = currentTime - dataAdicao;
    const tempoRestante = TEMPO_BLOQUEIO_MS - tempoPassado;
    
    if (tempoRestante <= 0) return { bloqueado: false, texto: 'Liberado para compra' };
    
    const horasRestantes = Math.floor(tempoRestante / (1000 * 60 * 60));
    return { bloqueado: true, texto: `Bloqueado por mais ${horasRestantes}h` };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm hover:scale-105 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black flex items-center gap-2 text-slate-800 dark:text-white">
            <ShieldCheck className="text-amber-500" /> Agente Sentinela
          </h1>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-amber-500 p-3 rounded-xl text-white hover:bg-amber-600 shadow-lg shadow-amber-200 dark:shadow-none transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Configuração de Valor por Hora */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-indigo-500"/> Quanto vale sua hora?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Usado para converter preços em "Horas de Vida".
            </p>
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

        {/* Info Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-2xl flex gap-3">
          <AlertOctagon className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Qualquer link de checkout adicionado aqui sofrerá uma <strong>quarentena de 72 horas</strong>. Se você ainda quiser comprar depois desse tempo, o Sentinela libera o acesso.
          </p>
        </div>

        {/* Lista de Desejos / Quarentena */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">
            Fila de Quarentena ({compras.length})
          </h3>
          
          {compras.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <p className="text-slate-400">Sua mente está livre de impulsos no momento.</p>
            </div>
          )}

          {compras.map((item) => {
            const { bloqueado, texto } = getStatusBloqueio(item.dataAdicao);
            const horasDeVida = (item.valor / (valorHora || 1)).toFixed(1);

            return (
              <div key={item.id} className={`p-5 rounded-2xl border transition-all ${
                bloqueado 
                  ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-80' 
                  : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900 shadow-sm'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">{item.produto}</h4>
                    <p className="text-xl font-black text-slate-800 dark:text-white mt-1">
                      R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button onClick={() => removerCompra(item.id)} className="text-slate-400 hover:text-red-500 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Cálculo de Horas de Vida */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 p-3 rounded-xl text-sm font-medium flex items-center gap-2 mb-4">
                  <Clock size={16} />
                  Isso vai custar <strong>{horasDeVida} horas</strong> de trabalho da sua vida.
                </div>

                {/* Status e Ação */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className={`flex items-center gap-2 text-sm font-bold ${
                    bloqueado ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {bloqueado ? <Lock size={16} /> : <Unlock size={16} />}
                    {texto}
                  </div>
                  
                  <button 
                    disabled={bloqueado}
                    onClick={() => window.open(item.link, '_blank')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      bloqueado 
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
      </div>

      {/* Modal de Adição */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-black mb-2 text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="text-amber-500"/> Interceptar Compra
            </h2>
            <p className="text-sm text-slate-500 mb-6">Coloque esse impulso em quarentena.</p>
            
            <input 
              type="text" placeholder="O que você quer comprar?" 
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4 outline-none focus:ring-2 ring-amber-500 dark:text-white"
              value={novoProduto} onChange={(e) => setNovoProduto(e.target.value)}
            />
            <input 
              type="text" placeholder="Valor (R$)" 
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4 outline-none focus:ring-2 ring-amber-500 dark:text-white"
              value={novoValor} onChange={(e) => setNovoValor(e.target.value)}
            />
            <input 
              type="url" placeholder="Link do Checkout (Opcional)" 
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 mb-6 outline-none focus:ring-2 ring-amber-500 dark:text-white text-sm"
              value={novoLink} onChange={(e) => setNovoLink(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={fecharModal} className="flex-1 p-4 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                Desistir
              </button>
              <button onClick={adicionarCompra} className="flex-1 bg-amber-500 p-4 rounded-xl text-white font-bold hover:bg-amber-600 transition-colors">
                Bloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenteSentinela;