import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../api/firebase';

interface UseFirestoreCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useFirestoreCollection<T = DocumentData>(
  path: string,
  ...segments: (string | QueryConstraint)[]
): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stringSegments = segments.filter((s): s is string => typeof s === 'string');
    const constraints = segments.filter((s): s is QueryConstraint => typeof s !== 'string');

    const colRef = collection(db, path, ...stringSegments);
    const q = query(colRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Firestore collection error [${path}]:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path, ...segments]);

  return { data, loading, error };
}
