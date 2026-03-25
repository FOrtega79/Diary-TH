import { differenceInCalendarDays } from 'date-fns';
import { getTodayString } from './dateHelpers';

export interface StreakUpdate {
  streakCount: number;
  lastStreakDate: string;
}

export function calculateStreakUpdate(
  currentStreak: number,
  lastStreakDate: string | null,
): StreakUpdate {
  const today = getTodayString();

  if (!lastStreakDate) {
    return { streakCount: 1, lastStreakDate: today };
  }

  if (lastStreakDate === today) {
    // Already logged today — no change
    return { streakCount: currentStreak, lastStreakDate };
  }

  const last = new Date(lastStreakDate);
  const diff = differenceInCalendarDays(new Date(today), last);

  if (diff === 1) {
    // Consecutive day — extend streak
    return { streakCount: currentStreak + 1, lastStreakDate: today };
  }

  // Gap — reset streak
  return { streakCount: 1, lastStreakDate: today };
}
