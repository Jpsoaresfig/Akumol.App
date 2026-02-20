import { useState, useEffect } from 'react';
import { auth, db } from '../api/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// IMPORTANTE: Use "type" para estas importações
import type { User } from 'firebase/auth';
import type { UserProfile } from '../types';
export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Referência ao documento do usuário no Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        
        // Monitoramento em tempo real para refletir mudanças de plano instantaneamente
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

  return { user, loading };
};