import React, { useState } from 'react';
import { 
  Radar, TicketPercent, Coins, PlaneTakeoff, CheckCircle2, 
  ArrowRight, ArrowLeft, RefreshCw, Search, ShoppingCart, Link
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Função auxiliar de formatação
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

type RadarInsight = {
  id: string;
  type: 'cashback' | 'miles' | 'coupon';
  title: string;
  description: string;
  potentialValue?: number;
  actionText: string;
  actionUrl?: string; // Link real para o usuário clicar (ex: link de afiliado)
  status: 'pending' | 'resolved';
};

const AgenteRadar: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados Reais
  const [isScanning, setIsScanning] = useState(false);
  const [insights, setInsights] = useState<RadarInsight[]>([]);
  const [intencaoCompra, setIntencaoCompra] = useState('');
  const [hasScanned, setHasScanned] = useState(false);

  // FUNÇÃO REAL: Onde a mágica (chamada de API) acontece
  const buscarOportunidades = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!intencaoCompra.trim()) return alert("Digite o que você quer comprar ou cole o link!");

    setIsScanning(true);
    setHasScanned(true);
    setInsights([]); // Limpa buscas anteriores

    try {
      /* ============================================================
        AQUI ENTRA A SUA INTEGRAÇÃO REAL COM O BACKEND (FIREBASE)
        ============================================================
        Você enviará o `intencaoCompra` para sua Cloud Function.
        Exemplo:
        
        const token = await user.getIdToken();
        const response = await fetch('https://sua-api.com/api/radar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ query: intencaoCompra })
        });
        const data = await response.json();
        setInsights(data.insights);
      */

      // Simulando o tempo de resposta do seu Backend/IA (Remova o setTimeout na versão final)
      await new Promise(resolve => setTimeout(resolve, 3500));

      // Simulando o retorno que o SEU BACKEND DEVE ENVIAR após consultar as APIs de Afiliados
      const dadosDoBackend: RadarInsight[] = [
        {
          id: Math.random().toString(),
          type: 'cashback',
          title: `Cashback Encontrado para: ${intencaoCompra}`,
          description: 'Encontramos 8% de cashback ativo através do portal do Banco Inter ou Méliuz para esta categoria.',
          potentialValue: 120.00,
          actionText: 'Ativar no Méliuz',
          actionUrl: 'https://meliuz.com.br',
          status: 'pending'
        }
      ];

      setInsights(dadosDoBackend);

    } catch (error) {
      console.error("Erro ao buscar dados reais:", error);
      alert("Falha ao contactar os radares. Tente novamente.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleResolve = (id: string, url?: string) => {
    // Marca como resolvido no visual
    setInsights(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
    
    // Se tiver um link real de cupom/cashback, redireciona o usuário
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-8 max-w-6xl mx-auto">
      
      <button 
        onClick={() => navigate('/agentes')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors w-fit"
      >
        <ArrowLeft size={16} /> Voltar para Central
      </button>

      {/* CABEÇALHO */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`p-3 bg-blue-100 dark:bg-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400 relative z-10 transition-all ${isScanning ? 'animate-pulse' : ''}`}>
              <Radar size={32} className={isScanning ? 'animate-spin' : ''} />
            </div>
            {isScanning && (
              <div className="absolute inset-0 bg-blue-400 rounded-2xl animate-ping opacity-20"></div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">Agente Radar</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Insira um produto ou loja e deixe a IA rastrear os benefícios.</p>
          </div>
        </div>
      </header>

      {/* NOVO: BARRA DE ENTRADA DO USUÁRIO */}
      <form onSubmit={buscarOportunidades} className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex gap-2">
        <div className="flex-1 flex items-center gap-3 px-4">
          <Link size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="O que você quer comprar? (Ex: iPhone 15, Amazon, Passagem Azul)" 
            className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
            value={intencaoCompra}
            onChange={(e) => setIntencaoCompra(e.target.value)}
            disabled={isScanning}
          />
        </div>
        <button 
          type="submit"
          disabled={isScanning || !intencaoCompra}
          className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isScanning ? <RefreshCw size={20} className="animate-spin" /> : <Search size={20} />}
          <span className="hidden sm:inline">Rastrear</span>
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: STATUS DO RADAR */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center overflow-hidden relative">
            <div className="w-48 h-48 rounded-full border-4 border-slate-50 dark:border-slate-800/50 flex items-center justify-center relative mb-6">
              <div className="w-32 h-32 rounded-full border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center relative z-10 shadow-inner">
                  <ShoppingCart size={24} className="text-blue-500" />
                </div>
                <div className={`absolute top-1/2 left-1/2 w-24 h-24 origin-top-left border-l-2 border-t-2 border-blue-400/50 rounded-tl-full ${isScanning ? 'animate-[spin_1.5s_linear_infinite]' : 'rotate-45 opacity-50'}`}>
                  <div className="absolute inset-0 bg-linear-to-br from-blue-400/20 to-transparent rounded-tl-full"></div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">
              {isScanning ? 'A varrer a web...' : hasScanned ? 'Busca Concluída' : 'Aguardando Alvo'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {isScanning 
                ? 'Procurando cupons válidos, cashbacks e bônus de milhas para sua compra.' 
                : hasScanned 
                  ? 'Veja ao lado os benefícios encontrados para sua compra.'
                  : 'Diga-nos o que quer comprar na barra acima para iniciar o rastreio.'}
            </p>

            <div className="w-full grid grid-cols-3 gap-2 mt-auto">
              {/* Mantive as estatísticas de categorias aqui */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <Coins size={16} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Cashback</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <PlaneTakeoff size={16} className="text-indigo-500 mx-auto mb-1" />
                <p className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Milhas</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/10 p-2 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <TicketPercent size={16} className="text-orange-500 mx-auto mb-1" />
                <p className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400">Cupons</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: INSIGHTS DE OTIMIZAÇÃO */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Search size={16} /> Benefícios Encontrados
            </h2>
            <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              {insights.filter(i => i.status === 'pending').length} Oportunidades
            </span>
          </div>

          {!hasScanned && !isScanning && (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
              <Search size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Digite o que deseja comprar acima para começarmos.</p>
            </div>
          )}

          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">A calcular stacking de descontos na web...</p>
            </div>
          ) : (
            insights.map((insight) => (
              <div 
                key={insight.id} 
                className={`bg-white dark:bg-slate-900 p-6 rounded-4xl border transition-all duration-300 ${
                  insight.status === 'resolved' 
                    ? 'border-slate-100 dark:border-slate-800 opacity-60 grayscale' 
                    : insight.type === 'cashback' 
                      ? 'border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700/50 shadow-sm'
                      : insight.type === 'coupon'
                      ? 'border-orange-100 dark:border-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700/50 shadow-sm'
                      : 'border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700/50 shadow-sm'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex gap-4 items-start">
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      insight.status === 'resolved' ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' :
                      insight.type === 'cashback' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                      insight.type === 'coupon' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' :
                      'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                    }`}>
                      {insight.status === 'resolved' ? <CheckCircle2 size={24} /> :
                       insight.type === 'cashback' ? <Coins size={24} /> : 
                       insight.type === 'coupon' ? <TicketPercent size={24} /> : 
                       <PlaneTakeoff size={24} />}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          insight.type === 'cashback' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                          insight.type === 'coupon' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                          'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                        }`}>
                          {insight.type === 'cashback' ? 'Cashback' : insight.type === 'coupon' ? 'Cupão Mágico' : 'Multiplicador'}
                        </span>
                        {insight.potentialValue && (
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            +{formatCurrency(insight.potentialValue)} poupados
                          </span>
                        )}
                      </div>
                      <h4 className={`text-lg font-bold ${insight.status === 'resolved' ? 'line-through text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                        {insight.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>

                  {insight.status === 'pending' && (
                    <button 
                      onClick={() => handleResolve(insight.id, insight.actionUrl)}
                      className={`shrink-0 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                        insight.type === 'cashback' ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none' :
                        insight.type === 'coupon' ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-200 dark:shadow-none' :
                        'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none'
                      }`}
                    >
                      {insight.actionText}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {hasScanned && !isScanning && insights.length === 0 && (
             <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
               <p className="text-slate-500">Nenhuma oportunidade detectada para esta compra no momento.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AgenteRadar;