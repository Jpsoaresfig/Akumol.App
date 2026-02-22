import { useState, useEffect } from 'react';
import { auth, db } from '../api/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        
        // Escuta mudanças no documento do usuário em tempo real
        unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              ...docSnap.data()
            } as UserProfile);
          } else {
            console.warn("Documento do usuário não encontrado no Firestore.");
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Erro ao escutar documento do usuário:", error);
          setLoading(false);
        });
      } else {
        // Se sair do Firebase Auth, limpa o estado e a escuta do Firestore
        if (unsubscribeDoc) unsubscribeDoc();
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  /**
   * Envia e-mail de recuperação de senha.
   */
  const resetPassword = async (email: string) => {
    try {
      // Usando o fluxo simplificado (configurações padrão do console Firebase)
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      let errorMessage = "Erro ao enviar e-mail de recuperação.";
      
      // Mapeamento de erros comuns do Firebase
      const errorCode = error?.code;
      if (errorCode === 'auth/user-not-found') errorMessage = "Utilizador não encontrado.";
      if (errorCode === 'auth/too-many-requests') errorMessage = "Muitas solicitações. Tente mais tarde.";
      if (errorCode === 'auth/invalid-email') errorMessage = "E-mail inválido.";
      
      console.error("Erro resetPassword:", error);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error("Erro ao sair:", error);
    }
  };

  return { user, loading, logout, resetPassword };
};