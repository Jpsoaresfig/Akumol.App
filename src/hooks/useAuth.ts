import { useState, useEffect } from 'react';
import { auth, db } from '../api/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';

import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '../types';

const dispatchToast = (message: string, type: 'success' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('akumol-toast', { detail: { message, type } }));
};

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          if (unsubscribeDoc) unsubscribeDoc();
          setUser(null);
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", firebaseUser.uid);
        unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              ...docSnap.data()
            } as UserProfile);
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Erro ao escutar usuário:", error);
          setLoading(false);
        });
      } else {
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

  const updateProfileData = async (data: Partial<UserProfile>) => {
    try {
      if (!auth.currentUser) throw new Error("Usuário não autenticado");
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      if (data.displayName || data.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName || auth.currentUser.displayName,
          photoURL: data.photoURL || auth.currentUser.photoURL
        });
      }

      await updateDoc(userRef, data);
      dispatchToast('Perfil atualizado com sucesso!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      dispatchToast('Erro ao atualizar perfil: ' + msg, 'error');
      throw error;
    }
  };

  const updateUserEmail = async (newEmail: string) => {
    try {
      if (!auth.currentUser) throw new Error("Usuário não autenticado");
      await updateEmail(auth.currentUser, newEmail);
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { email: newEmail });
      dispatchToast('E-mail atualizado com sucesso!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      dispatchToast('Erro ao atualizar e-mail: ' + msg, 'error');
      throw error;
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    try {
      if (!auth.currentUser) throw new Error("Usuário não autenticado");
      await updatePassword(auth.currentUser, newPassword);
      dispatchToast('Senha atualizada com sucesso!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      dispatchToast('Erro ao atualizar senha: ' + msg, 'error');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      return { success: false, error: msg };
    }
  };

  const logout = () => signOut(auth);

  return { 
    user, 
    loading, 
    logout, 
    resetPassword, 
    updateProfileData, 
    updateUserEmail, 
    updateUserPassword 
  };
};