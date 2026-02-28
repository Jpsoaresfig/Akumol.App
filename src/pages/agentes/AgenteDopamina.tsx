import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  ArrowLeft, 
  BrainCircuit, 
  Music, 
  Wind, 
  Coffee, 
  Activity,
  AlertCircle,
  Frown,
  Meh,
  Smile,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Mood = 'estressado' | 'cansado' | 'neutro' | 'feliz';

const AgenteDopamina: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado emocional atual (simulando que a IA detectou estresse pelo horário/padrão)
  const [currentMood, setCurrentMood] = useState<Mood>('estressado');
  
  // Estado para o exercício de respiração
  const [isBreathing, setIsBreathing] = useState(false);
  const [breatheText, setBreatheText] = useState('Inspire...');
  const [breatheScale, setBreatheScale] = useState(1);

  // Lógica do exercício de respiração (Ciclo 4-7-8 simplificado)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>; // <-- Troque por isso
    if (isBreathing) {
      let step = 0;
      interval = setInterval(() => {
        if (step === 0) {
          setBreatheText('Inspire profundamente...');
          setBreatheScale(1.5);
          step = 1;
        } else if (step === 1) {
          setBreatheText('Segure...');
          step = 2;
        } else {
          setBreatheText('Expire devagar...');
          setBreatheScale(1);
          step = 0;
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  // Recompensas de Custo Zero
  const recompensas = [
    { id: 'respira', nome: 'Exercício de Respiração', icon: Wind, desc: '1 minuto para baixar o cortisol', color: 'bg-teal-500', action: () => setIsBreathing(true) },
    { id: 'musica', nome: 'Playlist Dopamina', icon: Music, desc: 'Músicas que geram bem-estar', color: 'bg-purple-500', action: () => window.open('https://open.spotify.com', '_blank') },
    { id: 'pausa', nome: 'Pausa para o Café', icon: Coffee, desc: 'Saia da tela por 10 minutos', color: 'bg-amber-500', action: () => alert('Vá buscar uma água ou café, deixe o celular na mesa!') },
    { id: 'movimento', nome: 'Alongamento Rápido', icon: Activity, desc: 'Movimente o corpo', color: 'bg-rose-500', action: () => alert('Levante-se, estique os braços e olhe pela janela!') }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      
      {/* Botão Voltar */}
      <button 
        onClick={() => navigate('/agentes')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors w-fit mb-8 max-w-2xl mx-auto"
      >
        <ArrowLeft size={16} /> Voltar para Central
      </button>

      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="p-3 bg-pink-100 dark:bg-pink-500/20 rounded-2xl text-pink-600 dark:text-pink-400">
            <HeartPulse size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">Agente Dopamina</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Seu gestor de emoções e blindagem contra compras compensatórias.</p>
          </div>
        </header>

        {/* ALERTA DE VULNERABILIDADE (Dinâmico conforme o humor) */}
        {(currentMood === 'estressado' || currentMood === 'cansado') && (
          <div className="bg-pink-50 dark:bg-pink-900/10 border-l-4 border-pink-500 p-5 rounded-r-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="text-pink-600 dark:text-pink-400 shrink-0 mt-1 sm:mt-0" size={28} />
            <div>
              <h3 className="text-pink-800 dark:text-pink-300 font-black text-sm uppercase tracking-widest mb-1">Vulnerabilidade Detectada</h3>
              <p className="text-sm text-pink-700/80 dark:text-pink-400/80 leading-relaxed">
                Você parece estar <strong>{currentMood}</strong>. Historicamente, 80% das suas compras não essenciais acontecem neste estado emocional para gerar alívio rápido. <strong>Feche as lojas online agora.</strong>
              </p>
            </div>
          </div>
        )}

        {/* Seletor de Humor */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-slate-800 dark:text-white font-bold mb-4 flex items-center gap-2">
            <BrainCircuit className="text-slate-400" size={20} /> Como você está se sentindo agora?
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <button onClick={() => setCurrentMood('estressado')} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${currentMood === 'estressado' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Frown size={24} /> <span className="text-xs font-bold">Estresse</span>
            </button>
            <button onClick={() => setCurrentMood('cansado')} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${currentMood === 'cansado' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Meh size={24} /> <span className="text-xs font-bold">Cansaço</span>
            </button>
            <button onClick={() => setCurrentMood('neutro')} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${currentMood === 'neutro' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Smile size={24} /> <span className="text-xs font-bold">Neutro</span>
            </button>
            <button onClick={() => setCurrentMood('feliz')} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${currentMood === 'feliz' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <HeartPulse size={24} /> <span className="text-xs font-bold">Bem</span>
            </button>
          </div>
        </div>

        {/* Recompensas de Custo Zero */}
        <div>
          <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest mb-4 px-2">
            Obtenha Dopamina Sem Gastar (Custo R$ 0,00)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recompensas.map((rec) => (
              <button 
                key={rec.id}
                onClick={rec.action}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-start gap-4 group"
              >
                <div className={`p-3 rounded-xl text-white shrink-0 shadow-lg ${rec.color}`}>
                  <rec.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-pink-500 transition-colors">{rec.nome}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{rec.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Modal / Overlay do Exercício de Respiração */}
      {isBreathing && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in p-6">
          <button 
            onClick={() => setIsBreathing(false)}
            className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-black text-white mb-16">Desacelere sua mente</h2>
            
            <div className="relative flex items-center justify-center w-64 h-64 mb-16">
              {/* Círculo Animado */}
              <div 
                className="absolute bg-pink-500/20 rounded-full transition-all duration-[3000ms] ease-in-out"
                style={{ 
                  width: `${breatheScale * 100}%`, 
                  height: `${breatheScale * 100}%` 
                }}
              />
              <div 
                className="absolute bg-pink-500/40 rounded-full transition-all duration-[3000ms] ease-in-out delay-75"
                style={{ 
                  width: `${breatheScale * 75}%`, 
                  height: `${breatheScale * 75}%` 
                }}
              />
              <div className="relative z-10 w-32 h-32 bg-pink-500 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(236,72,153,0.5)]">
                <Wind size={40} className="text-white animate-pulse" />
              </div>
            </div>

            <p className="text-3xl font-black text-pink-100 transition-all duration-500">
              {breatheText}
            </p>
            <p className="text-pink-300/60 text-sm mt-4">
              Respire fundo. A vontade de comprar vai passar.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AgenteDopamina;