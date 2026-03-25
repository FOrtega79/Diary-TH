import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { calculateStreakUpdate } from '@/utils/streakHelpers';

export async function updateStreak(
  uid: string,
  currentStreak: number,
  lastStreakDate: string | null,
): Promise<{ streakCount: number; lastStreakDate: string }> {
  const update = calculateStreakUpdate(currentStreak, lastStreakDate);

  // Only write if changed
  if (
    update.streakCount !== currentStreak ||
    update.lastStreakDate !== lastStreakDate
  ) {
    await updateDoc(doc(db, 'users', uid), {
      streakCount: update.streakCount,
      lastStreakDate: update.lastStreakDate,
    });
  }

  return update;
}
