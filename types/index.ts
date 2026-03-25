import { Timestamp } from 'firebase/firestore';

// ─── Firestore Document Types ────────────────────────────────────────────────

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  therianType: string;
  therianTypeCustom: string;
  therianTypeSecondary: string;
  isPro: boolean;
  createdAt: Timestamp;
  lastActive: Timestamp;
  streakCount: number;
  lastStreakDate: string; // YYYY-MM-DD
  packId: string | null;
  fcmToken: string | null;
}

export interface ShiftDoc {
  id: string;
  uid: string;
  title: string;
  trigger: string;
  intensity: number; // 0–10
  shiftType: string;
  shiftTypeCustom: string;
  notes: string;
  imageUrl: string | null;
  audioUrl: string | null;
  isSharedWithPack: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PackDoc {
  id: string;
  name: string;
  createdBy: string; // uid
  members: string[]; // uid[]
  createdAt: Timestamp;
}

export interface PackInviteDoc {
  id: string;
  packId: string;
  invitedBy: string; // uid
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
}

// ─── App State Types ──────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type ShiftFilter = 'all' | 'week' | 'month' | 'type';

export interface NewShiftFormData {
  shiftType: string;
  shiftTypeCustom: string;
  trigger: string;
  intensity: number;
  notes: string;
  imageUri: string | null;
  audioUri: string | null;
  isSharedWithPack: boolean;
}
