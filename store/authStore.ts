import { create } from 'zustand';
import { AuthUser, UserDoc } from '@/types';

interface AuthState {
  user: AuthUser | null;
  userDoc: UserDoc | null;
  isPro: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  paywallVisible: boolean;
  setUser: (user: AuthUser | null) => void;
  setUserDoc: (doc: UserDoc | null) => void;
  setIsPro: (isPro: boolean) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setPaywallVisible: (visible: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userDoc: null,
  isPro: false,
  isLoading: true,
  isInitialized: false,
  paywallVisible: false,
  setUser: (user) => set({ user }),
  setUserDoc: (userDoc) => set({ userDoc, isPro: userDoc?.isPro ?? false }),
  setIsPro: (isPro) => set({ isPro }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setPaywallVisible: (paywallVisible) => set({ paywallVisible }),
  reset: () =>
    set({
      user: null,
      userDoc: null,
      isPro: false,
      isLoading: false,
      paywallVisible: false,
    }),
}));
