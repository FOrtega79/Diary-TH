import { useEffect } from 'react';
import { getPackById, getPackMembers, subscribeToPackShifts } from '@/services/pack';
import { usePackStore } from '@/store/packStore';
import { useAuthStore } from '@/store/authStore';

export function usePack() {
  const { userDoc } = useAuthStore();
  const { setPack, setMembers, setSharedShifts, setLoading } = usePackStore();

  useEffect(() => {
    if (!userDoc?.packId) {
      setPack(null);
      setMembers([]);
      setSharedShifts([]);
      return;
    }

    setLoading(true);

    let unsubscribeShifts: (() => void) | undefined;

    getPackById(userDoc.packId)
      .then(async (pack) => {
        if (!pack) return;
        setPack(pack);

        const members = await getPackMembers(pack.members);
        setMembers(members);

        unsubscribeShifts = subscribeToPackShifts(
          pack.members,
          (shifts) => {
            setSharedShifts(shifts);
            setLoading(false);
          },
          () => setLoading(false),
        );
      })
      .catch(() => setLoading(false));

    return () => {
      unsubscribeShifts?.();
    };
  }, [userDoc?.packId]);
}
