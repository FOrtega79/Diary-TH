import { useState, useCallback } from 'react';
import { loadAndShowRewardedAd, AdType } from '@/services/admob';
import { useShiftStore } from '@/store/shiftStore';

export function useRewardedAd(type: AdType) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { imageUnlocked, audioUnlocked, setImageUnlocked, setAudioUnlocked } = useShiftStore();

  const isUnlocked = type === 'image' ? imageUnlocked : audioUnlocked;

  const watchAd = useCallback(() => {
    if (isUnlocked) return;
    setIsLoading(true);
    setError(null);

    const cleanup = loadAndShowRewardedAd(
      type,
      () => {
        setIsLoading(false);
        if (type === 'image') setImageUnlocked(true);
        else setAudioUnlocked(true);
        cleanup();
      },
      (err) => {
        setIsLoading(false);
        setError('Ad not available right now. Try again later.');
        cleanup();
      },
    );
  }, [type, isUnlocked]);

  return { isUnlocked, isLoading, error, watchAd };
}
