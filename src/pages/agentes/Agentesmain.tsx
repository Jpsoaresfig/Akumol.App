import React from 'react';
import { ShieldCheck, Zap, Target, Users, Brain, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AgenteCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  description: string;
  plan: string;
  color: string;
  locked: boolean;
  path?: string;
}

const AgenteCard: React.FC<AgenteCardProps> = ({ 
  icon: Icon, 
  name, 
  description, 
  plan, 
  color, 
  locked,
  path 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!locked && path) {
      navigate(path);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative overflow-hidden group transition-all cursor-pointer 
        ${locked ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1 active:scale-95'}`}
    >
      <div className={`p-4 rounded-2xl w-fit mb-6 ${color}`}>
        <Icon size={32} className="text-white" />
      </div>
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{name}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          Plano {plan}
        </span>
        {locked && <span className="text-indigo-600 font-black text-[10px] uppercase">Upgrade</span>}
      </div>
    </div>
  );
};

const Agentes: React.FC = () => {
  const { user } = useAuth();
  const plan = user?.plan || 'basic';

  const agentes: AgenteCardProps[] = [
    { 
      icon: ShieldCheck, 
      name: 'Sentinela', 
      description: 'O filtro de 72h contra compras por impulso.', 
      plan: 'Basic', 
      color: 'bg-indigo-600', 
      locked: false,
      path: '/agentes/sentinela'
    },
    { 
      icon: Zap, 
      name: 'Sombra', 
      description: 'Exterminador de taxas e assinaturas inúteis.', 
      plan: 'Premium', 
      color: 'bg-red-500', 
      locked: !['premium', 'plus', 'ultimate'].includes(plan),
      path: '/agentes/sombra'
    },
    { 
      icon: Target, 
      name: 'Radar', 
      description: 'Stacking automático de milhas e cashbacks.', 
      plan: 'Premium', 
      color: 'bg-orange-500', 
      locked: !['premium', 'plus', 'ultimate'].includes(plan),
      path: '/agentes/radar'
    },
    { 
      icon: HeartPulse, 
      name: 'Dopamina', 
      description: 'Bloqueio de gastos por humor e estresse.', 
      plan: 'Plus', 
      color: 'bg-pink-500', 
      locked: !['plus', 'ultimate'].includes(plan),
      path: '/agentes/dopamina' // ✅ Rota adicionada
    },
    { icon: Brain, name: 'Arquiteto', description: 'Converte economia em tempo de aposentadoria.', plan: 'Plus', color: 'bg-emerald-500', locked: !['plus', 'ultimate'].includes(plan) },
    { icon: Users, name: 'Resiliência', description: 'Cofres invisíveis para blindagem familiar.', plan: 'Ultimate', color: 'bg-amber-500', locked: plan !== 'ultimate' },
  ];

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 lg:pb-8">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white">Conselho de Diretores IA</h1>
        <p className="text-slate-500 mt-2 font-medium">Seus guardiões comportamentais ativos.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentes.map((agente, idx) => <AgenteCard key={idx} {...agente} />)}
      </div>
    </div>
  );
};

export default Agentes;