import { useState, useEffect } from 'react';
import { auth, db } from '../api/firebase';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
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
   * Envia e-mail de recuperação de senha via Firebase Auth
   */
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: unknown) { // Alterado de any para unknown para segurança
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao resetar senha";
      console.error("Erro ao resetar senha:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Encerra a sessão do usuário
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao sair";
      console.error(errorMessage);
    }
  };

  return { user, loading, logout, resetPassword };
};