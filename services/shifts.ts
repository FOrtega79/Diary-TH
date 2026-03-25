import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { ShiftDoc, NewShiftFormData } from '@/types';
import { updateStreak } from './streak';
import * as ImageManipulator from 'expo-image-manipulator';

export async function createShift(
  uid: string,
  formData: NewShiftFormData,
  currentStreak: number,
  lastStreakDate: string | null,
): Promise<string> {
  let imageUrl: string | null = null;
  let audioUrl: string | null = null;

  // Upload image (max 5MB, compressed)
  if (formData.imageUri) {
    imageUrl = await uploadShiftImage(uid, formData.imageUri);
  }

  // Upload audio
  if (formData.audioUri) {
    audioUrl = await uploadShiftAudio(uid, formData.audioUri);
  }

  const shiftData = {
    uid,
    title: '',
    trigger: formData.trigger,
    intensity: formData.intensity,
    shiftType: formData.shiftType,
    shiftTypeCustom: formData.shiftTypeCustom,
    notes: formData.notes,
    imageUrl,
    audioUrl,
    isSharedWithPack: formData.isSharedWithPack,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'shifts'), shiftData);

  // Update streak
  await updateStreak(uid, currentStreak, lastStreakDate);

  return docRef.id;
}

export async function updateShift(
  shiftId: string,
  uid: string,
  formData: Partial<NewShiftFormData>,
  existingImageUrl: string | null,
  existingAudioUrl: string | null,
): Promise<void> {
  let imageUrl = existingImageUrl;
  let audioUrl = existingAudioUrl;

  if (formData.imageUri && formData.imageUri !== existingImageUrl) {
    if (existingImageUrl) await deleteStorageFile(existingImageUrl);
    imageUrl = await uploadShiftImage(uid, formData.imageUri);
  }

  if (formData.audioUri && formData.audioUri !== existingAudioUrl) {
    if (existingAudioUrl) await deleteStorageFile(existingAudioUrl);
    audioUrl = await uploadShiftAudio(uid, formData.audioUri);
  }

  await updateDoc(doc(db, 'shifts', shiftId), {
    ...(formData.trigger !== undefined && { trigger: formData.trigger }),
    ...(formData.intensity !== undefined && { intensity: formData.intensity }),
    ...(formData.shiftType !== undefined && { shiftType: formData.shiftType }),
    ...(formData.shiftTypeCustom !== undefined && { shiftTypeCustom: formData.shiftTypeCustom }),
    ...(formData.notes !== undefined && { notes: formData.notes }),
    ...(formData.isSharedWithPack !== undefined && { isSharedWithPack: formData.isSharedWithPack }),
    imageUrl,
    audioUrl,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteShift(shift: ShiftDoc): Promise<void> {
  if (shift.imageUrl) await deleteStorageFile(shift.imageUrl);
  if (shift.audioUrl) await deleteStorageFile(shift.audioUrl);
  await deleteDoc(doc(db, 'shifts', shift.id));
}

export function subscribeToShifts(
  uid: string,
  onData: (shifts: ShiftDoc[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'shifts'),
    where('uid', '==', uid),
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

async function uploadShiftImage(uid: string, localUri: string): Promise<string> {
  // Compress image to max ~800px wide, 80% quality
  const result = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 800 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );

  const response = await fetch(result.uri);
  const blob = await response.blob();

  if (blob.size > 5 * 1024 * 1024) {
    throw new Error('Image is too large (max 5MB after compression).');
  }

  const filename = `shifts/${uid}/${Date.now()}_image.jpg`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

async function uploadShiftAudio(uid: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const filename = `shifts/${uid}/${Date.now()}_audio.m4a`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

async function deleteStorageFile(url: string): Promise<void> {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch {
    // Ignore errors on delete (file may already be gone)
  }
}
