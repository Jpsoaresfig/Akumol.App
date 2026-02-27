import React, { useMemo } from 'react';
import { Target, Zap, Clock, TrendingUp } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';

// --- 1. FUNÇÕES AUXILIARES E TIPAGENS MOVIDAS PARA FORA ---

// Função de formatar moeda global para o arquivo
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Interface para remover o erro de "any" do TypeScript
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      economia: number;
    };
  }>;
  label?: string;
}

// O componente Tooltip agora fica do lado de fora!
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-white">
          {formatCurrency(payload[0].value)}
        </p>
        <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs font-bold">
          <TrendingUp size={14} />
          <span>+ {formatCurrency(payload[0].payload.economia)} economizados</span>
        </div>
      </div>
    );
  }
  return null;
};

// --- 2. COMPONENTE PRINCIPAL ---

const Evolucao = () => {
  const { user } = useAuth();

  // Lógica de dados dinâmicos baseados no patrimônio
  const totalInvested = user?.financialData?.totalInvested || 0;
  const balance = user?.financialData?.balance || 0;
  const patrimonioTotal = totalInvested + balance;

  const data = useMemo(() => {
    const baseValue = patrimonioTotal > 0 ? patrimonioTotal : 5000; 

    return [
      { month: 'Set', saldo: baseValue * 0.70, economia: baseValue * 0.05, impulsos: 5 },
      { month: 'Out', saldo: baseValue * 0.78, economia: baseValue * 0.08, impulsos: 3 },
      { month: 'Nov', saldo: baseValue * 0.82, economia: baseValue * 0.04, impulsos: 4 },
      { month: 'Dez', saldo: baseValue * 0.88, economia: baseValue * 0.06, impulsos: 1 },
      { month: 'Jan', saldo: baseValue * 0.95, economia: baseValue * 0.07, impulsos: 2 },
      { month: 'Fev', saldo: baseValue,        economia: baseValue * 0.05, impulsos: 0 }, 
    ];
  }, [patrimonioTotal]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-8">
      
      {/* CABEÇALHO */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">Métricas de Evolução</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Análise profunda da sua saúde financeira baseada no seu patrimônio.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Patrimônio Atual</p>
          <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">{formatCurrency(patrimonioTotal)}</p>
        </div>
      </header>

      {/* GRÁFICO PRINCIPAL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-48 -mt-48 opacity-60 pointer-events-none"></div>

        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 relative z-10 flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-500" />
          Crescimento de Patrimônio
        </h3>
        
        <div className="h-75 md:h-100 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/80" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} 
                dy={10}
              />
              <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="saldo" 
                stroke="#4f46e5" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorSaldo)" 
                activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRID DE PERFORMANCE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        
        <div className="bg-emerald-50 dark:bg-emerald-500/5 p-6 md:p-8 rounded-4xl border border-emerald-100 dark:border-emerald-500/10 hover:shadow-lg transition-all">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl w-fit mb-6">
            <Target size={24} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-1">Taxa de Poupança</p>
          <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
            {user?.financialData?.savingsRatio ? `${user.financialData.savingsRatio}%` : '24%'}
          </h3>
          <p className="text-xs font-bold text-emerald-600/60 dark:text-emerald-400/60 mt-2">+4% em relação ao mês passado</p>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-500/5 p-6 md:p-8 rounded-4xl border border-indigo-100 dark:border-indigo-500/10 hover:shadow-lg transition-all">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl w-fit mb-6">
            <Clock size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-400/70 mb-1">Herança Temporal</p>
          <h3 className="text-3xl font-black text-indigo-700 dark:text-indigo-400">
            {user?.financialData?.hoursSaved || 0} Horas
          </h3>
          <p className="text-xs font-bold text-indigo-600/60 dark:text-indigo-400/60 mt-2">De vida recuperadas do sistema</p>
        </div>

        <div className="bg-red-50 dark:bg-red-500/5 p-6 md:p-8 rounded-4xl border border-red-100 dark:border-red-500/10 hover:shadow-lg transition-all sm:col-span-2 md:col-span-1">
          <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-2xl w-fit mb-6">
            <Zap size={24} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-600/70 dark:text-red-400/70 mb-1">Impulsos Exterminados</p>
          <h3 className="text-3xl font-black text-red-700 dark:text-red-400">12 Desejos</h3>
          <p className="text-xs font-bold text-red-600/60 dark:text-red-400/60 mt-2">Poupando aproximadamente R$ 1.240,00</p>
        </div>

      </div>
    </div>
  );
};

export default Evolucao;