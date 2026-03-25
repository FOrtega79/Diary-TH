import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { PackDoc, PackInviteDoc, ShiftDoc, UserDoc } from '@/types';

export async function createPack(uid: string, name: string): Promise<string> {
  const packRef = await addDoc(collection(db, 'packs'), {
    name,
    createdBy: uid,
    members: [uid],
    createdAt: serverTimestamp(),
  });

  // Update user's packId
  await updateDoc(doc(db, 'users', uid), { packId: packRef.id });
  return packRef.id;
}

export async function inviteMember(packId: string, invitedBy: string, invitedEmail: string): Promise<string> {
  const inviteRef = await addDoc(collection(db, 'packInvites'), {
    packId,
    invitedBy,
    invitedEmail,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return inviteRef.id;
}

export async function acceptInvite(inviteId: string, uid: string): Promise<void> {
  const inviteSnap = await getDoc(doc(db, 'packInvites', inviteId));
  if (!inviteSnap.exists()) throw new Error('Invite not found');
  const invite = inviteSnap.data() as PackInviteDoc;

  // Add user to pack
  await updateDoc(doc(db, 'packs', invite.packId), {
    members: arrayUnion(uid),
  });

  // Update user's packId
  await updateDoc(doc(db, 'users', uid), { packId: invite.packId });

  // Mark invite accepted
  await updateDoc(doc(db, 'packInvites', inviteId), { status: 'accepted' });
}

export async function getPackById(packId: string): Promise<PackDoc | null> {
  const snap = await getDoc(doc(db, 'packs', packId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PackDoc;
}

export async function getPackMembers(memberUids: string[]): Promise<UserDoc[]> {
  if (memberUids.length === 0) return [];
  const members: UserDoc[] = [];
  for (const uid of memberUids) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) members.push({ ...snap.data() } as UserDoc);
  }
  return members;
}

export function subscribeToPackShifts(
  memberUids: string[],
  onData: (shifts: ShiftDoc[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (memberUids.length === 0) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, 'shifts'),
    where('uid', 'in', memberUids.slice(0, 10)), // Firestore 'in' limit is 10
    where('isSharedWithPack', '==', true),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const shifts = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ShiftDoc[];
      onData(shifts);
    },
    (error) => onError?.(error),
  );
}
