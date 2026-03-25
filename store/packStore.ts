import { create } from 'zustand';
import { PackDoc, ShiftDoc, UserDoc } from '@/types';

interface PackState {
  pack: PackDoc | null;
  members: UserDoc[];
  sharedShifts: (ShiftDoc & { authorDoc?: UserDoc })[];
  isLoading: boolean;
  setPack: (pack: PackDoc | null) => void;
  setMembers: (members: UserDoc[]) => void;
  setSharedShifts: (shifts: (ShiftDoc & { authorDoc?: UserDoc })[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const usePackStore = create<PackState>((set) => ({
  pack: null,
  members: [],
  sharedShifts: [],
  isLoading: false,
  setPack: (pack) => set({ pack }),
  setMembers: (members) => set({ members }),
  setSharedShifts: (sharedShifts) => set({ sharedShifts }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ pack: null, members: [], sharedShifts: [], isLoading: false }),
}));
