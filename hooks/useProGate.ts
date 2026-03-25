import { useAuthStore } from '@/store/authStore';

export function useProGate() {
  const { isPro, setPaywallVisible } = useAuthStore();

  function checkPro(callback: () => void): void {
    if (isPro) {
      callback();
    } else {
      setPaywallVisible(true);
    }
  }

  return { checkPro, isPro };
}
