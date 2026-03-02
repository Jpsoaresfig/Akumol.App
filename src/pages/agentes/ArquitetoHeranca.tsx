import React from 'react';
import { Landmark, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ArquitetoProps {
  patrimonioTotal: number;
  gastosMensais: number;
}

const ArquitetoHeranca: React.FC<ArquitetoProps> = ({ patrimonioTotal, gastosMensais }) => {
  const navigate = useNavigate();

  const mesesLiberdade = gastosMensais > 0 ? (patrimonioTotal / gastosMensais).toFixed(1) : "0";
  const anosLiberdade = (parseFloat(mesesLiberdade) / 12).toFixed(1);

  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl border border-slate-700/50 relative overflow-hidden">
      <Landmark size={120} className="absolute -right-8 -bottom-8 text-white/5 -rotate-12" />
      
      <div className="relative z-10">
        <button 
          onClick={() => navigate('/agentes')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Voltar aos Agentes</span>
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Clock size={20} className="text-amber-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arquiteto de Herança</span>
        </div>

        <h3 className="text-xl font-bold mb-1">Sua Ilha de Liberdade</h3>
        <p className="text-xs text-slate-400 mb-6">Seu patrimônio hoje compra sua alforria por:</p>

        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-amber-400 tracking-tighter">{mesesLiberdade}</span>
          <span className="text-xl font-bold text-slate-300">Meses</span>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">Equivale a:</span>
            <span className="bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
              {anosLiberdade} Anos de Vida
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArquitetoHeranca;