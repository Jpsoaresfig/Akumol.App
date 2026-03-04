import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../api/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

import logoClara from '../../img/Logo_branca_Akumol.png';
import logoEscura from '../../img/logo_preta_Akumol.png';

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setResetMsg('');

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          displayName: name,
          email: email,
          plan: 'basic',
          role: 'user',
          createdAt: serverTimestamp(),
          financialData: { 
            hoursSaved: 0,
            savingsRatio: 0,
            totalInvested: 0
          },
          preferences: { 
            dopamineMode: true,
            weatherAutoSave: false
          }
        });

        await sendEmailVerification(userCredential.user);
        await signOut(auth);

        setIsRegistering(false);
        setResetMsg("Conta criada com sucesso! Enviamos um link para o seu e-mail. Por favor, confirme-o antes de fazer login (verifique também o spam).");
        
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
          await signOut(auth); 
          setErrorMsg("Você precisa confirmar o seu e-mail antes de acessar. Verifique sua caixa de entrada ou spam.");
          setIsLoading(false);
          return;
        }

        navigate('/');
      }
    } catch (error: unknown) {
      console.error("Erro Auth:", error);
      let mensagem = "Ocorreu um erro inesperado. Tente novamente.";
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const errorCode = (error as { code: string }).code;
        if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
          mensagem = "E-mail ou senha incorretos.";
        } else if (errorCode === 'auth/email-already-in-use') {
          mensagem = "Este e-mail já está cadastrado.";
        } else if (errorCode === 'auth/weak-password') {
          mensagem = "A senha deve ter pelo menos 6 caracteres.";
        }
      }
      setErrorMsg(mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg("Insira o seu e-mail no campo acima para recuperar a senha.");
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await resetPassword(email);
      if (res.success) {
        setResetMsg("E-mail de recuperação enviado! Verifique a sua caixa de entrada.");
      } else {
        setErrorMsg("Erro ao enviar e-mail de recuperação.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4 font-sans transition-colors duration-500">
      <div className="w-full max-w-105 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-900/5 dark:shadow-black/50 p-8 sm:p-10 border border-white/50 dark:border-slate-800 transition-all duration-500 relative overflow-hidden">
        
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-5 drop-shadow-md hover:scale-105 transition-transform duration-300">
              <img 
                src={logoClara} 
                alt="Akumol" 
                className="block dark:hidden w-full h-full object-contain"
              />
              <img 
                src={logoEscura} 
                alt="Akumol" 
                className="hidden dark:block w-full h-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">
              {isRegistering ? 'Criar Conta' : 'Bem-vindo(a) ao Akumol'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {isRegistering ? 'Inicie a sua jornada financeira' : 'O seu Guardião Digital aguarda'}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {errorMsg && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="leading-snug">{errorMsg}</p>
              </div>
            )}
            {resetMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 flex items-start gap-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <p className="leading-snug">{resetMsg}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                disabled={isLoading}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-1.5 ml-1 pr-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Senha</label>
                {!isRegistering && (
                  <button 
                    type="button" 
                    onClick={handleResetPassword} 
                    disabled={isLoading}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                  >
                    Esqueceu?
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-6 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                isRegistering ? 'Criar minha conta' : 'Acessar Guardião'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMsg('');
                setResetMsg('');
              }} 
              disabled={isLoading}
              className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
            >
              {isRegistering 
                ? 'Já tem uma conta? Faça login' 
                : 'Não tem conta? Cadastre-se grátis'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;