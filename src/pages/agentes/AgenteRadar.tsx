import React, { useState } from 'react';
import {
  Radar, TicketPercent, Coins, PlaneTakeoff, CheckCircle2,
  ArrowRight, ArrowLeft, RefreshCw, Search, ShoppingCart,
  Settings, X, AlertCircle, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../api/firebase';
import { getDoc, doc } from 'firebase/firestore';

const resolveGeminiKey = async (): Promise<string> => {
  const local = localStorage.getItem('gemini_api_key');
  if (local) return local;
  try {
    const snap = await getDoc(doc(db, 'config', 'agents'));
    if (snap.exists()) return snap.data().geminiApiKey || '';
  } catch { /* sem config global */ }
  return '';
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

type InsightType = 'cashback' | 'miles' | 'coupon';

interface RadarInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  potentialValue: number;
  actionText: string;
  actionUrl: string;
  status: 'pending' | 'resolved';
}

interface GeminiInsight {
  type?: string;
  title?: string;
  description?: string;
  potentialValue?: number;
  actionText?: string;
  actionUrl?: string;
}

const typeColors: Record<InsightType, { bg: string; text: string; badge: string; btn: string }> = {
  cashback: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
  },
  coupon: {
    bg: 'bg-orange-50 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300',
    btn: 'bg-orange-600 hover:bg-orange-700 shadow-orange-200',
  },
  miles: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
    btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
  },
};

const typeIcon: Record<InsightType, React.ReactNode> = {
  cashback: <Coins size={22} />,
  coupon: <TicketPercent size={22} />,
  miles: <PlaneTakeoff size={22} />,
};

const typeLabel: Record<InsightType, string> = {
  cashback: 'Cashback',
  coupon: 'Cupom',
  miles: 'Milhas',
};

const SYSTEM_PROMPT = `Você é o Agente Radar Akumol, especialista em economia inteligente no Brasil.
Com base no produto ou loja informado, sugira oportunidades reais e conhecidas de economia para consumidores brasileiros.

Para o produto/loja informado, liste:
1. Portais de cashback conhecidos no Brasil (Méliuz, Inter Shop, Ame Digital, C6 Bank, Nubank Rewards, PicPay, Livelo) com percentuais típicos por categoria
2. Cupons e estratégias de desconto em varejistas brasileiros relevantes (Americanas, Magazine Luiza, Shopee, Amazon BR, Mercado Livre, Casas Bahia)
3. Oportunidades de acúmulo de milhas/pontos (Livelo, Esfera, TudoAzul, Smiles, Latam Pass) para a categoria do produto

Use conhecimento real sobre esses programas — percentuais típicos, como ativar, onde se cadastrar.

Responda SOMENTE com um array JSON válido, sem texto adicional, sem markdown, sem explicações.
Formato exato:
[
  {
    "type": "cashback",
    "title": "Título curto e claro",
    "description": "Descrição concreta com detalhes da oportunidade, portal e como ativar",
    "potentialValue": 0,
    "actionText": "Ver Oferta",
    "actionUrl": "https://url-real-do-portal.com.br"
  }
]

Tipos válidos: "cashback", "coupon", "miles"
potentialValue: estimativa de economia em BRL (número inteiro, pode ser 0 se percentual variável)
actionUrl: URL real e válida do portal (ex: meliuz.com.br, interpag.com.br, livelo.com.br)
Retorne entre 4 e 6 resultados variados. Baseie-se em programas reais existentes no Brasil.`;

const AgenteRadar: React.FC = () => {
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(false);
  const [insights, setInsights] = useState<RadarInsight[]>([]);
  const [query, setQuery] = useState('');
  const [hasScanned, setHasScanned] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState('');

  const parseInsights = (text: string): RadarInsight[] => {
    try {
      const clean = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const start = clean.indexOf('[');
      const end = clean.lastIndexOf(']');
      if (start === -1 || end === -1) return [];

      const arr: GeminiInsight[] = JSON.parse(clean.slice(start, end + 1));
      const validTypes: InsightType[] = ['cashback', 'coupon', 'miles'];

      return arr
        .filter((item) => item && item.title && item.description)
        .map((item, idx) => ({
          id: `${Date.now()}-${idx}`,
          type: validTypes.includes(item.type as InsightType) ? (item.type as InsightType) : 'cashback',
          title: item.title || '',
          description: item.description || '',
          potentialValue: Number(item.potentialValue) || 0,
          actionText: item.actionText || 'Ver Oferta',
          actionUrl: item.actionUrl || '',
          status: 'pending',
        }));
    } catch {
      return [];
    }
  };

  const buscarOportunidades = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const resolvedKey = apiKey || await resolveGeminiKey();
    if (!resolvedKey) {
      setTempKey('');
      setShowSettings(true);
      return;
    }

    setIsScanning(true);
    setHasScanned(true);
    setInsights([]);
    setErrorMsg('');

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${resolvedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{
              role: 'user',
              parts: [{ text: `Encontre oportunidades de cashback, cupons e milhas para: ${query}` }]
            }],
            generationConfig: { temperature: 0.3 },
          }),
        }
      );

      const data = await res.json();

      if (data.error) {
        const msg: string = data.error.message || '';
        if (data.error.code === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          throw new Error('QUOTA_EXCEEDED');
        }
        throw new Error(msg);
      }

      const text: string = data.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || '')
        .join('') || '';

      const found = parseInsights(text);

      if (found.length === 0) {
        setErrorMsg('Nenhuma promoção estruturada encontrada. Tente uma busca mais específica.');
      } else {
        setInsights(found);
      }
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Radar error:', e);
      if (e.message === 'QUOTA_EXCEEDED') {
        setErrorMsg('Limite de uso da API atingido. Aguarde alguns minutos e tente novamente, ou gere uma nova chave em aistudio.google.com.');
      } else if (e.message?.includes('API_KEY') || e.message?.includes('key') || e.message?.includes('API key')) {
        setErrorMsg('Chave de API inválida ou expirada. Clique em ⚙ para configurar uma nova chave.');
      } else {
        setErrorMsg('Falha na comunicação com a IA. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleResolve = (id: string, url: string) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', tempKey);
    setApiKey(tempKey);
    setShowSettings(false);
  };

  const pendingCount = insights.filter(i => i.status === 'pending').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">

      {/* HEADER */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate('/agentes')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <button
          onClick={() => { setTempKey(apiKey); setShowSettings(true); }}
          className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all"
          title="Configurar API Key"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 ${isScanning ? 'animate-pulse' : ''}`}>
          <Radar size={28} className={isScanning ? 'animate-spin' : ''} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Agente Radar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            IA especializada — encontra cashbacks, cupons e milhas no Brasil.
          </p>
        </div>
      </div>

      {/* BARRA DE BUSCA */}
      <form onSubmit={buscarOportunidades} className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 flex items-center gap-3 px-3">
          <ShoppingCart size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Ex: iPhone 15, Amazon, passagem Azul, Nike..."
            className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isScanning}
          />
        </div>
        <button
          type="submit"
          disabled={isScanning || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors flex items-center gap-2 active:scale-95 shrink-0"
        >
          {isScanning
            ? <RefreshCw size={16} className="animate-spin" />
            : <Search size={16} />
          }
          <span className="hidden sm:inline">{isScanning ? 'Buscando...' : 'Rastrear'}</span>
        </button>
      </form>

      {/* ERRO */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm animate-in fade-in">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* CONTEÚDO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* STATUS VISUAL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col items-center text-center gap-4">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full border-2 border-slate-100 dark:border-slate-800" />
            <div className="absolute inset-4 rounded-full border-2 border-slate-100 dark:border-slate-800" />
            <div className="absolute inset-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <ShoppingCart size={20} className="text-blue-500" />
            </div>
            {isScanning && (
              <div className="absolute inset-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
            )}
          </div>

          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-base">
              {isScanning ? 'Rastreando...' : hasScanned ? 'Busca Concluída' : 'Aguardando'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {isScanning
                ? 'Analisando cashbacks e promoções via Gemini IA'
                : hasScanned
                  ? `${pendingCount} oportunidade${pendingCount !== 1 ? 's' : ''} encontrada${pendingCount !== 1 ? 's' : ''}`
                  : 'Digite um produto ou loja para começar'}
            </p>
          </div>

          <div className="w-full grid grid-cols-3 gap-2">
            {(['cashback', 'coupon', 'miles'] as InsightType[]).map((t) => {
              const c = typeColors[t];
              return (
                <div key={t} className={`p-2 rounded-xl border ${c.bg}`}>
                  <div className={`mx-auto w-fit ${c.text}`}>{typeIcon[t]}</div>
                  <p className={`text-[9px] font-black uppercase mt-1 ${c.text}`}>{typeLabel[t]}</p>
                </div>
              );
            })}
          </div>

          {!apiKey && (
            <button
              onClick={() => { setTempKey(''); setShowSettings(true); }}
              className="w-full text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Configurar API Key
            </button>
          )}
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Search size={13} /> Resultados
            </span>
            {pendingCount > 0 && (
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">
                {pendingCount} ativa{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Estado inicial */}
          {!hasScanned && !isScanning && (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center">
              <Search size={40} className="text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm text-slate-400 font-medium">Digite o produto acima para rastrear promoções reais</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Powered by Gemini AI</p>
            </div>
          )}

          {/* Carregando */}
          {isScanning && (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">
                Analisando oportunidades de economia...
              </p>
              <p className="text-xs text-slate-400 mt-1">Isso pode levar alguns segundos</p>
            </div>
          )}

          {/* Resultados */}
          {!isScanning && insights.map((insight) => {
            const c = typeColors[insight.type];
            const resolved = insight.status === 'resolved';
            return (
              <div
                key={insight.id}
                className={`border rounded-3xl p-5 transition-all duration-300 ${
                  resolved
                    ? 'border-slate-100 dark:border-slate-800 opacity-50 grayscale'
                    : c.bg
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex gap-3 items-start flex-1 min-w-0">
                    <div className={`p-2.5 rounded-2xl shrink-0 ${resolved ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : c.badge}`}>
                      {resolved ? <CheckCircle2 size={20} /> : typeIcon[insight.type]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${c.badge}`}>
                          {typeLabel[insight.type]}
                        </span>
                        {insight.potentialValue > 0 && (
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            +{fmt(insight.potentialValue)} estimado
                          </span>
                        )}
                      </div>
                      <h4 className={`font-bold text-sm md:text-base ${resolved ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                        {insight.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {insight.description}
                      </p>
                      {insight.actionUrl && !resolved && (
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                          <ExternalLink size={10} /> {insight.actionUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  {!resolved && (
                    <button
                      onClick={() => handleResolve(insight.id, insight.actionUrl)}
                      className={`shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white transition-all active:scale-95 shadow-lg dark:shadow-none ${c.btn}`}
                    >
                      {insight.actionText}
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Sem resultados após busca */}
          {hasScanned && !isScanning && insights.length === 0 && !errorMsg && (
            <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
              <p className="text-slate-400 text-sm">Nenhuma promoção encontrada para esta busca.</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Tente um termo mais específico ou diferente.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL API KEY */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Settings size={18} className="text-blue-500" /> Chave Gemini
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                  API Key (Google AI Studio)
                </label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 ring-blue-500 transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Gere gratuitamente em <strong>aistudio.google.com</strong>. A mesma chave do Conselheiro funciona aqui.
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm"
              >
                Salvar e Usar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenteRadar;
