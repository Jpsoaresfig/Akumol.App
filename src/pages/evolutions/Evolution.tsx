
import { Target, Zap, Clock } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';

// Dados simulados (Você pode depois buscar isso do Firebase)
const data = [
  { month: 'Set', saldo: 4200, economia: 800, impulsos: 5 },
  { month: 'Out', saldo: 4900, economia: 1200, impulsos: 3 },
  { month: 'Nov', saldo: 5500, economia: 950, impulsos: 4 },
  { month: 'Dez', saldo: 7200, economia: 2100, impulsos: 1 },
  { month: 'Jan', saldo: 8800, economia: 1800, impulsos: 2 },
  { month: 'Fev', saldo: 10450, economia: 2400, impulsos: 0 },
];

const Evolucao = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tight dark:text-white">Métricas de Evolução</h1>
        <p className="text-slate-500 dark:text-slate-400">Análise profunda da sua saúde financeira.</p>
      </header>

      {/* Gráfico Principal */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
        <div className="h-100 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="saldo" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSaldo)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
          <Target className="text-emerald-500 mb-4" />
          <h3 className="text-emerald-900 dark:text-emerald-400 font-bold">Eficiência</h3>
          <p className="text-2xl font-black text-emerald-600">+24% este mês</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-500/20">
          <Clock className="text-indigo-500 mb-4" />
          <h3 className="text-indigo-900 dark:text-indigo-400 font-bold">Tempo Salvo</h3>
          <p className="text-2xl font-black text-indigo-600">{user?.financialData?.hoursSaved || 0}h de Vida</p>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-3xl border border-red-100 dark:border-red-500/20">
          <Zap className="text-red-500 mb-4" />
          <h3 className="text-red-900 dark:text-red-400 font-bold">Impulsos Barrados</h3>
          <p className="text-2xl font-black text-red-600">12 Desejos</p>
        </div>
      </div>
    </div>
  );
};

export default Evolucao;