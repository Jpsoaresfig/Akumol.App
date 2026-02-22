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
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              ...docSnap.data()
            } as UserProfile);
          }
          setLoading(false);
        });
        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  /**
   * Envia e-mail de recuperação de senha com configurações de redirecionamento.
   */
  const resetPassword = async (email: string) => {
    try {
      // Define para onde o utilizador volta após redefinir a senha
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = "Erro ao enviar e-mail de recuperação.";
      
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const errorCode = (error as { code: string }).code;
        if (errorCode === 'auth/user-not-found') errorMessage = "Utilizador não encontrado.";
        if (errorCode === 'auth/too-many-requests') errorMessage = "Muitas solicitações. Tente mais tarde.";
        if (errorCode === 'auth/invalid-email') errorMessage = "E-mail inválido.";
      }
      
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