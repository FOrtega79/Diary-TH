import { useAuthStore } from '@/store/authStore';
import { useShiftStore } from '@/store/shiftStore';
import { formatRelative } from '@/utils/dateHelpers';

export function useStreak() {
  const { userDoc } = useAuthStore();
  const { shifts } = useShiftStore();

  const streakCount = userDoc?.streakCount ?? 0;
  const lastShift = shifts[0] ?? null;
  const lastShiftRelative = lastShift ? formatRelative(lastShift.createdAt) : 'No shifts yet';

  return {
    streakCount,
    lastStreakDate: userDoc?.lastStreakDate ?? null,
    lastShiftRelative,
  };
}
