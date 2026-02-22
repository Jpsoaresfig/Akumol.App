import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, AlertCircle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

// Importação das logos como variáveis
import logoClara from '../../img/Logo_branca_Akumol.png';
import logoEscura from '../../img/logo_preta_Akumol.png';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await resetPassword(email);
    
    if (res.success) {
      setSuccessMsg("Link de recuperação enviado com sucesso! Verifique a sua caixa de entrada.");
    } else {
      setErrorMsg(res.error || "Ocorreu um erro ao tentar enviar o e-mail.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-6 font-sans transition-colors duration-300">
      {/* Decoração de Fundo (Blur Gradients) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 border border-white dark:border-slate-800 transition-all relative z-10">
        
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 drop-shadow-xl hover:scale-105 transition-transform duration-300">
            <img src={logoClara} alt="Akumol" className="block dark:hidden w-full h-full object-contain" />
            <img src={logoEscura} alt="Akumol" className="hidden dark:block w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white mb-2">
            Recuperar Acesso
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            O seu Guardião Digital ajudará a restaurar a sua senha.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 flex items-start gap-3 rounded-2xl border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg ? (
          <div className="text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-100 dark:border-green-900/50">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <div className="p-4 bg-green-50/50 dark:bg-green-500/5 rounded-2xl text-green-700 dark:text-green-400 text-sm font-semibold">
              {successMsg}
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
            >
              Voltar ao Início
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  required
                  className="input-field pl-14 w-full h-14 text-base bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full h-14 flex items-center justify-center text-base font-black tracking-tight shadow-xl shadow-indigo-200 dark:shadow-none active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                'Enviar Código de Resgate'
              )}
            </button>

            <div className="pt-4">
              <Link 
                to="/login" 
                className="group flex items-center justify-center gap-3 text-sm font-black text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Lembra-se da senha? Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;