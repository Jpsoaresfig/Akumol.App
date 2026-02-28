import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification, // Nova importação
  signOut // Nova importação
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../api/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

// Importação das logos como variáveis para garantir o processamento pelo Vite
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
        // Fluxo de Registo no Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Criar documento no Firestore
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

        // ✅ ENVIAR E-MAIL DE VERIFICAÇÃO
        await sendEmailVerification(userCredential.user);

        // ✅ DESLOGAR IMEDIATAMENTE APÓS O CADASTRO
        await signOut(auth);

        // Voltar para a tela de login e avisar o usuário
        setIsRegistering(false);
        setResetMsg("Conta criada com sucesso! Enviamos um link para o seu e-mail. Por favor, confirme-o antes de fazer login (verifique também o spam).");
        
      } else {
        // Fluxo de Login no Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // ✅ VERIFICAR SE O E-MAIL FOI CONFIRMADO
        if (!userCredential.user.emailVerified) {
          await signOut(auth); // Desloga o usuário imediatamente
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-4 font-sans transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 drop-shadow-sm">
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
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white uppercase">
            {isRegistering ? 'Criar Conta' : 'AKUMOL'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            {isRegistering ? 'Inicie a sua jornada financeira' : 'O seu Guardião Digital aguarda'}
          </p>
        </div>

        {/* Mensagens de Feedback */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 flex items-start gap-3 rounded-2xl border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}
        {resetMsg && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-100 dark:border-green-900/50 text-green-700 dark:text-green-400 text-sm font-medium text-center">
            {resetMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <input
                type="text"
                placeholder="Nome completo"
                disabled={isLoading}
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div>
            <input
              type="email"
              placeholder="E-mail"
              disabled={isLoading}
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Senha"
              disabled={isLoading}
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center mt-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              isRegistering ? 'Criar minha conta' : 'Acessar Guardião'
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center space-y-4">
          {!isRegistering && (
            <button 
              type="button" 
              onClick={handleResetPassword} 
              disabled={isLoading}
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              Esqueci a minha senha
            </button>
          )}
          
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

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
              ? 'Já tem uma conta? Faça login aqui' 
              : 'Não tem conta? Cadastre-se gratuitamente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;