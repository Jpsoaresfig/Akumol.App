import { useState } from 'react';
import { ShieldCheck, Zap, Brain, Users, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  features: PlanFeature[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Grátis',
    period: '',
    color: 'bg-slate-500',
    icon: ShieldCheck,
    features: [
      { text: 'Dashboard financeiro', included: true },
      { text: 'Metas de economia', included: true },
      { text: 'Agente Sentinela (72h)', included: true },
      { text: 'Conselheiro IA', included: true },
      { text: 'Agente Sombra', included: false },
      { text: 'Agente Radar', included: false },
      { text: 'Agente Dopamina', included: false },
      { text: 'Agente Arquiteto', included: false },
      { text: 'Agente Resiliência', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 19,90',
    period: '/mês',
    color: 'bg-orange-500',
    icon: Zap,
    highlighted: true,
    features: [
      { text: 'Tudo do Basic', included: true },
      { text: 'Agente Sombra', included: true },
      { text: 'Agente Radar (cashbacks)', included: true },
      { text: 'Análise de assinaturas', included: true },
      { text: 'Suporte prioritário', included: true },
      { text: 'Agente Dopamina', included: false },
      { text: 'Agente Arquiteto', included: false },
      { text: 'Agente Resiliência', included: false },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 'R$ 49,90',
    period: '/mês',
    color: 'bg-emerald-500',
    icon: Brain,
    features: [
      { text: 'Tudo do Premium', included: true },
      { text: 'Agente Dopamina', included: true },
      { text: 'Agente Arquiteto', included: true },
      { text: 'Calculadora de aposentadoria', included: true },
      { text: 'Relatórios avançados', included: true },
      { text: 'Agente Resiliência', included: false },
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: 'R$ 99,90',
    period: '/mês',
    color: 'bg-amber-500',
    icon: Users,
    features: [
      { text: 'Tudo do Plus', included: true },
      { text: 'Agente Resiliência', included: true },
      { text: 'Cofres invisíveis familiares', included: true },
      { text: 'Consultoria IA ilimitada', included: true },
      { text: 'Onboarding personalizado', included: true },
      { text: 'Suporte VIP 24h', included: true },
    ],
  },
];

const Plans = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const currentPlanId = user?.plan || 'basic';

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'basic') return;
    setSelectedPlan(planId);
    setProcessing(true);

    try {
      const { httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../../api/firebase');
      const createCheckout = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckout({ plan: planId, userId: user?.uid });

      const { url } = result.data as { url: string };
      if (url) {
        window.location.href = url;
      }
    } catch (e) {
      console.error('Erro ao criar checkout:', e);
      alert('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-8 px-4">
      <div className="text-center mb-12 pt-8">
        <h1 className="text-3xl md:text-4xl font-black dark:text-white mb-3">
          Escolha seu plano
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Desbloqueie mais agentes e recursos conforme sua jornada financeira.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const PlanIcon = plan.icon;
          const isCurrent = plan.id === currentPlanId;

          return (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-slate-900 border rounded-3xl p-6 flex flex-col transition-all ${
                plan.highlighted
                  ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105 z-10'
                  : 'border-slate-100 dark:border-slate-800 shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Popular
                </div>
              )}

              <div className={`p-3 rounded-2xl w-fit mb-4 ${plan.color}`}>
                <PlanIcon size={24} className="text-white" />
              </div>

              <h2 className="text-xl font-black dark:text-white mb-1">{plan.name}</h2>
              <div className="mb-6">
                {plan.price === 'Grátis' ? (
                  <span className="text-3xl font-black dark:text-white">Grátis</span>
                ) : (
                  <>
                    <span className="text-3xl font-black dark:text-white">{plan.price}</span>
                    <span className="text-slate-400 text-sm ml-1">{plan.period}</span>
                  </>
                )}
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 ${feat.included ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>
                      <Check size={16} />
                    </div>
                    <span className={`text-sm ${feat.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600 line-through'}`}>
                      {feat.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrent || processing}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60 ${
                  isCurrent
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                    : plan.highlighted
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {processing && selectedPlan === plan.id ? (
                  <Loader2 size={18} className="animate-spin mx-auto" />
                ) : isCurrent ? (
                  'Plano Atual'
                ) : plan.price === 'Grátis' ? (
                  'Downgrade'
                ) : (
                  'Assinar'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Plans;
