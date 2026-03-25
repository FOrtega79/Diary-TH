import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserDoc } from '@/types';

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserDoc(credential.user.uid, email, displayName, '');
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle(idToken: string): Promise<void> {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const credential = await signInWithCredential(auth, googleCredential);
  const { uid, email, displayName, photoURL } = credential.user;

  // Create user doc if first sign-in
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await createUserDoc(uid, email ?? '', displayName ?? '', photoURL ?? '');
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function createUserDoc(
  uid: string,
  email: string,
  displayName: string,
  avatarUrl: string,
): Promise<void> {
  const userDoc: Omit<UserDoc, 'id'> = {
    uid,
    email,
    displayName,
    avatarUrl,
    bio: '',
    therianType: '',
    therianTypeCustom: '',
    therianTypeSecondary: '',
    isPro: false,
    createdAt: serverTimestamp() as any,
    lastActive: serverTimestamp() as any,
    streakCount: 0,
    lastStreakDate: '',
    packId: null,
    fcmToken: null,
  };
  await setDoc(doc(db, 'users', uid), userDoc, { merge: true });
}

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDoc;
}

export function mapFirebaseError(code: string): string {
  const errors: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 8 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return errors[code] ?? 'Something went wrong. Please try again.';
}
