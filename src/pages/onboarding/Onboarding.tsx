import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../api/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, ArrowRight, PiggyBank, Target, Wallet } from 'lucide-react';

type Step = 'welcome' | 'salary' | 'expenses' | 'goal' | 'done';

const Onboarding = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('welcome');
  const [salary, setSalary] = useState('');
  const [expenses, setExpenses] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const saveOnboarding = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const salario = parseFloat(salary.replace(',', '.')) || 0;
      const despesas = parseFloat(expenses.replace(',', '.')) || 0;
      const balance = Math.max(0, salario - despesas);

      await updateDoc(userRef, {
        'financialData.salary': salario,
        'financialData.monthlyExpenses': despesas,
        'financialData.balance': balance,
        onboardingComplete: true,
      });

      if (goalName && goalAmount) {
        const { addDoc, collection } = await import('firebase/firestore');
        await addDoc(collection(db, 'users', user.uid, 'goals'), {
          name: goalName,
          targetAmount: parseFloat(goalAmount.replace(',', '.')) || 0,
          monthlySavings: Math.max(0, salario - despesas) * 0.3,
          createdAt: new Date(),
        });
      }
    } catch (e) {
      console.error('Erro ao salvar onboarding:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/50 dark:border-slate-800">
        {step === 'welcome' && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-indigo-600 p-4 rounded-2xl w-fit mx-auto mb-6">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-black dark:text-white mb-2">Bem-vindo ao Akumol!</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Vamos configurar seu guardião financeiro em 3 passos.
            </p>
            <button
              onClick={() => setStep('salary')}
              className="bg-indigo-600 text-white w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
            >
              Começar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 'salary' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-emerald-100 dark:bg-emerald-500/20 p-3 rounded-2xl w-fit mb-6">
              <Wallet size={28} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-black dark:text-white mb-2">Qual sua renda mensal?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Seu salário ou faturamento mensal aproximado.
            </p>
            <div className="relative mb-8">
              <span className="absolute left-4 top-4 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="0,00"
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-10 py-4 text-xl font-black outline-none focus:ring-2 ring-emerald-500 dark:text-white transition-all"
              />
            </div>
            <button
              onClick={() => setStep('expenses')}
              disabled={!salary}
              className="bg-emerald-600 text-white w-full py-4 rounded-xl font-bold disabled:opacity-50 active:scale-95 transition-all shadow-lg"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 'expenses' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-red-100 dark:bg-red-500/20 p-3 rounded-2xl w-fit mb-6">
              <PiggyBank size={28} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-black dark:text-white mb-2">Quanto você gasta por mês?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Suas despesas fixas e variáveis mensais.
            </p>
            <div className="relative mb-8">
              <span className="absolute left-4 top-4 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                placeholder="0,00"
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-10 py-4 text-xl font-black outline-none focus:ring-2 ring-red-500 dark:text-white transition-all"
              />
            </div>
            <button
              onClick={() => setStep('goal')}
              disabled={!expenses}
              className="bg-red-600 text-white w-full py-4 rounded-xl font-bold disabled:opacity-50 active:scale-95 transition-all shadow-lg"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 'goal' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-amber-100 dark:bg-amber-500/20 p-3 rounded-2xl w-fit mb-6">
              <Target size={28} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-black dark:text-white mb-2">Qual seu próximo grande objetivo?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Opcional — defina uma meta financeira.
            </p>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="Ex: Viagem dos sonhos"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-amber-500 dark:text-white mb-3 transition-all"
            />
            <div className="relative mb-8">
              <span className="absolute left-4 top-4 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="Valor da meta"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-10 py-4 text-lg font-bold outline-none focus:ring-2 ring-amber-500 dark:text-white transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setStep('done'); saveOnboarding(); }}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-xl font-bold active:scale-95 transition-all"
              >
                Pular
              </button>
              <button
                onClick={() => { setStep('done'); saveOnboarding(); }}
                disabled={!goalName || !goalAmount || saving}
                className="flex-1 bg-amber-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 active:scale-95 transition-all shadow-lg"
              >
                {saving ? 'Salvando...' : 'Definir Meta'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-emerald-100 dark:bg-emerald-500/20 p-4 rounded-2xl w-fit mx-auto mb-6">
              <ShieldCheck size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black dark:text-white mb-2">Tudo pronto!</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Seu guardião financeiro está configurado. Vamos começar!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              Ir para o Dashboard <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
