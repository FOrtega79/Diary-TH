import { useEffect } from 'react';
import { subscribeToShifts } from '@/services/shifts';
import { useShiftStore } from '@/store/shiftStore';
import { useAuthStore } from '@/store/authStore';

export function useShifts() {
  const { user } = useAuthStore();
  const { setShifts, setLoading } = useShiftStore();

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsubscribe = subscribeToShifts(
      user.uid,
      (shifts) => {
        setShifts(shifts);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, [user?.uid]);
}
