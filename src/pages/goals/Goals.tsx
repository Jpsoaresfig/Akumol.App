import { useState, useEffect } from 'react';
import { Target, Calculator, Calendar, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../api/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  monthlySavings: number;
}

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [monthlySavings, setMonthlySavings] = useState<number | ''>('');
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const goalsRef = collection(db, 'users', user.uid, 'goals');
    const q = query(goalsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData: Goal[] = [];
      snapshot.forEach((doc) => {
        goalsData.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(goalsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddGoal = async () => {
    if (!goalName || !targetAmount || !monthlySavings || !user?.uid) return;

    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'goals'), {
        name: goalName,
        targetAmount: Number(targetAmount),
        monthlySavings: Number(monthlySavings),
        createdAt: new Date()
      });
      
      setGoalName('');
      setTargetAmount('');
      setMonthlySavings('');
      setIsAdding(false);
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user?.uid) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <Target className="text-indigo-600 dark:text-indigo-400" /> Minhas Metas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Planeje suas conquistas e saiba exatamente quando irá alcançá-las.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus size={18} /> Nova Meta
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Adicionar Nova Meta</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">O que quer conquistar?</label>
              <input 
                type="text" 
                placeholder="Ex: Viagem, Carro..."
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Valor Total (R$)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Poupando por mês (R$)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 dark:text-white transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setIsAdding(false)}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleAddGoal}
              disabled={!goalName || !targetAmount || !monthlySavings || isProcessing}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 active:scale-95 transition-all"
            >
              {isProcessing ? 'Salvando...' : 'Salvar Meta'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 && !isAdding && (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-dashed rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-full mb-4">
              <Target className="text-indigo-600 dark:text-indigo-400" size={32} />
            </div>
            <h3 className="text-lg font-bold dark:text-white mb-2">Nenhuma meta ainda</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              Adicione sua primeira meta e deixe o Akumol calcular exatamente quanto tempo falta para você conquistá-la.
            </p>
          </div>
        )}

        {goals.map((goal) => {
          const monthsToReach = Math.ceil(goal.targetAmount / goal.monthlySavings);
          const years = (monthsToReach / 12).toFixed(1);

          return (
            <div key={goal.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm relative group transition-all hover:shadow-md">
              <button 
                onClick={() => handleDeleteGoal(goal.id)}
                className="absolute top-6 right-6 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-2xl">
                  <Target className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg dark:text-white truncate pr-8">{goal.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Objetivo</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Valor Total</span>
                  <span className="font-bold dark:text-white">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Poupança Mensal</span>
                  <span className="font-bold text-emerald-500">{formatCurrency(goal.monthlySavings)}</span>
                </div>
              </div>

              <div className="bg-indigo-600 p-5 rounded-2xl text-white">
                <div className="flex items-center gap-2 mb-2 text-indigo-200">
                  <Calculator size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Tempo Estimado</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black leading-none">{monthsToReach}</span>
                  <span className="text-sm font-bold mb-1 opacity-80">meses</span>
                </div>
                {monthsToReach > 12 && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs bg-black/20 w-fit px-2.5 py-1 rounded-full text-indigo-100">
                    <Calendar size={12} />
                    <span>Aprox. {years} anos</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;