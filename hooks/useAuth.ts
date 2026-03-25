import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { UserDoc } from '@/types';

export function useAuth() {
  const { setUser, setUserDoc, setInitialized, setLoading, reset } = useAuthStore();

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });

        // Subscribe to user doc for real-time updates (pro status, streak, etc.)
        unsubscribeDoc = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              setUserDoc(snap.data() as UserDoc);
            }
            setInitialized(true);
            setLoading(false);
          },
          () => {
            setInitialized(true);
            setLoading(false);
          },
        );
      } else {
        unsubscribeDoc?.();
        unsubscribeDoc = null;
        reset();
        setInitialized(true);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDoc?.();
    };
  }, []);
}
