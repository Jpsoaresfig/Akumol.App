import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../api/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react'; // Ícones para feedback visual

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Novos estados para melhorar a experiência do utilizador
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
        // Fluxo de Registo
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Criação do documento do utilizador com os dados necessários para o Dashboard
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
        navigate('/'); // Redireciona para o Dashboard
      } else {
        // Fluxo de Login
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/'); // Redireciona para o Dashboard
      }
    
    } catch (error: any) {
      console.error("Erro Auth:", error);
      // Tratamento de erros mais amigável
      let mensagem = "Ocorreu um erro inesperado. Tente novamente.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        mensagem = "E-mail ou senha incorretos.";
      } else if (error.code === 'auth/email-already-in-use') {
        mensagem = "Este e-mail já está cadastrado.";
      } else if (error.code === 'auth/weak-password') {
        mensagem = "A senha deve ter pelo menos 6 caracteres.";
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
            <span className="text-white text-2xl font-black tracking-tighter">AI</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">
            {isRegistering ? 'Criar Conta' : 'Liberdade IA'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {isRegistering ? 'Inicie a sua jornada financeira' : 'O seu Guardião Digital aguarda'}
          </p>
        </div>

        {/* Mensagens de Alerta */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 flex items-start gap-3 rounded-2xl border border-red-100 text-red-600 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}
        {resetMsg && (
          <div className="mb-6 p-4 bg-green-50 rounded-2xl border border-green-100 text-green-700 text-sm font-medium text-center">
            {resetMsg}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <input
                type="text"
                placeholder="Nome completo"
                disabled={isLoading}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
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
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
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
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              isRegistering ? 'Criar minha conta' : 'Acessar Guardião'
            )}
          </button>
        </form>

        {/* Links Inferiores */}
        <div className="mt-8 flex flex-col items-center space-y-4">
          {!isRegistering && (
            <button 
              type="button" 
              onClick={handleResetPassword} 
              disabled={isLoading}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
            >
              Esqueci a minha senha
            </button>
          )}
          
          <div className="w-full h-px bg-slate-100"></div>

          <button 
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg('');
              setResetMsg('');
            }} 
            disabled={isLoading}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
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