import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  return null;
}

export function formatRelative(value: Timestamp | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return '';
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatTimestamp(value: Timestamp | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return '';
  return format(date, 'MMM d, yyyy · h:mm a');
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
