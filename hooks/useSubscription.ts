import { useEffect } from 'react';
import { getCustomerInfo, checkEntitlement, syncProStatus } from '@/services/revenuecat';
import { useAuthStore } from '@/store/authStore';

export function useSubscription() {
  const { user, isPro, setIsPro } = useAuthStore();

  useEffect(() => {
    if (!user?.uid) return;

    getCustomerInfo().then((info) => {
      if (!info) return;
      const proStatus = checkEntitlement(info);
      if (proStatus !== isPro) {
        setIsPro(proStatus);
        syncProStatus(user.uid, proStatus).catch(() => {});
      }
    });
  }, [user?.uid]);

  return { isPro };
}
