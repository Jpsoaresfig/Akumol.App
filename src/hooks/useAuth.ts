/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // Atualiza dados no Firestore (Bio, Nome, Foto)
  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    // Se houver displayName ou photoURL, atualiza também no Firebase Auth Profile
    if (data.displayName || data.photoURL) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName || auth.currentUser.displayName,
        photoURL: data.photoURL || auth.currentUser.photoURL
      });
    }

    await updateDoc(userRef, data);
  };

  const updateUserEmail = async (newEmail: string) => {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    await updateEmail(auth.currentUser, newEmail);
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { email: newEmail });
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    await updatePassword(auth.currentUser, newPassword);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
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