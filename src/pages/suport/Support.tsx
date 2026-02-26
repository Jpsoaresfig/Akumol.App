import React, { useState } from 'react';
import { db } from '../../api/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Send, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const Support = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [type, setType] = useState('erro');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: user?.uid,
        userName: user?.displayName || 'Utilizador Anónimo',
        userEmail: user?.email,
        type,
        message,
        status: 'open',
        createdAt: serverTimestamp()
      });
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      alert("Erro ao enviar reporte. Tente novamente." + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* EXPLICAÇÃO DO APP */}
      <section className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg"><Info size={24} /></div>
          <h1 className="text-2xl font-black tracking-tight">O que é o Akumol IA?</h1>
        </div>
        <p className="text-indigo-50 leading-relaxed font-medium">
          O Akumol é o seu <strong>Guardião Digital</strong>. Somos uma plataforma de inteligência artificial 
          concebida para maximizar a sua evolução pessoal. Através do nosso Conselheiro e Agentes especializados, 
          ajudamos a poupar tempo, gerir métricas de vida e tomar decisões estratégicas com base em dados.
        </p>
      </section>

      {/* FORMULÁRIO DE SUPORTE */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg"><AlertCircle size={24} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Central de Reportes</h2>
            <p className="text-sm text-slate-500">Encontrou um erro ou tem uma sugestão? O nosso Admin irá analisar.</p>
          </div>
        </div>

        {sent ? (
          <div className="bg-green-50 dark:bg-green-500/10 p-6 rounded-2xl flex items-center gap-3 text-green-600 font-bold animate-bounce">
            <CheckCircle2 size={24} /> Reporte enviado com sucesso!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-2">Tipo de Feedback</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-sm text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
                >
                  <option value="erro">Bug / Erro no Sistema</option>
                  <option value="sugestao">Sugestão de Melhoria</option>
                  <option value="duvida">Dúvida / Suporte</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-2">Mensagem Detalhada</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva o erro ou a funcionalidade que gostaria de ver..."
                className="w-full h-40 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-slate-700 dark:text-slate-200 resize-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
            >
              {loading ? "A processar..." : <><Send size={18} /> Enviar para Análise</>}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default Support;