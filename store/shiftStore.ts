import { create } from 'zustand';
import { ShiftDoc } from '@/types';

interface ShiftState {
  shifts: ShiftDoc[];
  isLoading: boolean;
  imageUnlocked: boolean; // session-level rewarded ad unlock
  audioUnlocked: boolean; // session-level rewarded ad unlock
  setShifts: (shifts: ShiftDoc[]) => void;
  addShift: (shift: ShiftDoc) => void;
  updateShift: (id: string, updates: Partial<ShiftDoc>) => void;
  removeShift: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setImageUnlocked: (unlocked: boolean) => void;
  setAudioUnlocked: (unlocked: boolean) => void;
}

export const useShiftStore = create<ShiftState>((set) => ({
  shifts: [],
  isLoading: false,
  imageUnlocked: false,
  audioUnlocked: false,
  setShifts: (shifts) => set({ shifts }),
  addShift: (shift) => set((state) => ({ shifts: [shift, ...state.shifts] })),
  updateShift: (id, updates) =>
    set((state) => ({
      shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  removeShift: (id) =>
    set((state) => ({ shifts: state.shifts.filter((s) => s.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setImageUnlocked: (imageUnlocked) => set({ imageUnlocked }),
  setAudioUnlocked: (audioUnlocked) => set({ audioUnlocked }),
}));
