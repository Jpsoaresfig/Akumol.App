import { useState, useEffect } from 'react';
import { doc, onSnapshot, type DocumentData } from 'firebase/firestore';
import { db } from '../api/firebase';

interface UseFirestoreDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFirestoreDocument<T = DocumentData>(
  path: string,
  ...segments: string[]
): UseFirestoreDocumentResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, path, ...segments);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data() as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Firestore doc error [${path}/${segments.join('/')}]:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path, ...segments]);

  return { data, loading, error };
}
