import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(uid: string): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  const token = await Notifications.getExpoPushTokenAsync();
  await updateDoc(doc(db, 'users', uid), { fcmToken: token.data });
  return true;
}

export async function scheduleStreakReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Therian Diary',
      body: "🐾 Don't break your streak! Log a shift to keep it alive.",
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
}

export async function cancelStreakReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function sendStreakMilestoneNotification(streakCount: number): Promise<void> {
  if (![7, 14, 30].includes(streakCount)) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Streak Milestone!',
      body: `🔥 ${streakCount} day streak! You're in the flow.`,
    },
    trigger: null, // immediate
  });
}
