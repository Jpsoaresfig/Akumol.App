import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../api/firebase';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          savingsRatio: 0,
          hoursSaved: 0
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    
    } catch (error: unknown) { // Alterado de any para unknown
      // Verificação de tipo para garantir segurança e remover o aviso do linter
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
      alert("Erro na autenticação: " + errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">
          {isRegistering ? 'Criar Conta' : 'Akumol'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <input
              type="text"
              placeholder="Nome completo"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="E-mail"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg">
            {isRegistering ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>
        <div className="mt-6 text-center space-y-2">
          {!isRegistering && (
            <button onClick={() => email ? resetPassword(email) : alert("Insira seu e-mail")} className="text-sm text-indigo-600 hover:underline block w-full">
              Esqueceu a senha?
            </button>
          )}
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-slate-500">
            {isRegistering ? 'Já tem conta? Entre' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;