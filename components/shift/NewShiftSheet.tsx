import React, { forwardRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { X, Camera, Mic, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { ShiftTypeSelector } from './ShiftTypeSelector';
import { IntensitySlider } from './IntensitySlider';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors, spacing, radii, fontSizes } from '@/constants/theme';
import { NewShiftFormData, ShiftDoc } from '@/types';
import { createShift, updateShift } from '@/services/shifts';
import { useAuthStore } from '@/store/authStore';
import { useShiftStore } from '@/store/shiftStore';
import { useRewardedAd } from '@/hooks/useRewardedAd';
import Toast from 'react-native-toast-message';

const SNAP_POINTS = ['95%'];

const DEFAULT_FORM: NewShiftFormData = {
  shiftType: 'mental',
  shiftTypeCustom: '',
  trigger: '',
  intensity: 5,
  notes: '',
  imageUri: null,
  audioUri: null,
  isSharedWithPack: false,
};

interface NewShiftSheetProps {
  editingShift?: ShiftDoc | null;
  onClose: () => void;
}

export const NewShiftSheet = forwardRef<BottomSheet, NewShiftSheetProps>(
  ({ editingShift, onClose }, ref) => {
    const { user, userDoc } = useAuthStore();
    const { addShift, updateShift: updateShiftInStore } = useShiftStore();
    const imageAd = useRewardedAd('image');
    const audioAd = useRewardedAd('audio');

    const [form, setForm] = useState<NewShiftFormData>(
      editingShift
        ? {
            shiftType: editingShift.shiftType,
            shiftTypeCustom: editingShift.shiftTypeCustom,
            trigger: editingShift.trigger,
            intensity: editingShift.intensity,
            notes: editingShift.notes,
            imageUri: editingShift.imageUrl,
            audioUri: editingShift.audioUrl,
            isSharedWithPack: editingShift.isSharedWithPack,
          }
        : DEFAULT_FORM,
    );
    const [saving, setSaving] = useState(false);

    const updateForm = (patch: Partial<NewShiftFormData>) =>
      setForm((prev) => ({ ...prev, ...patch }));

    const handleSubmit = async () => {
      if (!user || !form.trigger.trim() || !form.shiftType) {
        Toast.show({ type: 'error', text1: 'Please fill in all required fields.' });
        return;
      }

      setSaving(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      try {
        if (editingShift) {
          await updateShift(
            editingShift.id,
            user.uid,
            form,
            editingShift.imageUrl,
            editingShift.audioUrl,
          );
          updateShiftInStore(editingShift.id, { ...form });
          Toast.show({ type: 'success', text1: 'Shift updated!' });
        } else {
          const id = await createShift(
            user.uid,
            form,
            userDoc?.streakCount ?? 0,
            userDoc?.lastStreakDate ?? null,
          );
          Toast.show({ type: 'success', text1: 'Shift logged!' });
        }

        setForm(DEFAULT_FORM);
        (ref as any)?.current?.close();
        onClose();
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Failed to save shift. Try again.' });
      } finally {
        setSaving(false);
      }
    };

    const handlePickImage = async () => {
      if (!imageAd.isUnlocked) {
        imageAd.watchAd();
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        updateForm({ imageUri: result.assets[0].uri });
      }
    };

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
      [],
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        onClose={onClose}
      >
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingShift ? 'Edit Shift' : 'Log a Shift'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                (ref as any)?.current?.close();
                onClose();
              }}
            >
              <X color={colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          {/* Shift Type */}
          <SectionLabel label="Shift Type *" />
          <ShiftTypeSelector
            value={form.shiftType}
            customValue={form.shiftTypeCustom}
            onChange={(type, custom) => updateForm({ shiftType: type, shiftTypeCustom: custom })}
          />

          {/* Trigger */}
          <SectionLabel label="Trigger *" />
          <Input
            value={form.trigger}
            onChangeText={(text) => updateForm({ trigger: text })}
            placeholder="What caused this shift? (a sound, a smell, a dream...)"
            multiline
            maxLength={300}
            numberOfLines={3}
            containerStyle={styles.inputContainer}
          />
          <Text style={styles.charCount}>{form.trigger.length}/300</Text>

          {/* Intensity */}
          <SectionLabel label="Intensity" />
          <IntensitySlider
            value={form.intensity}
            onChange={(val) => updateForm({ intensity: val })}
          />

          {/* Notes */}
          <SectionLabel label="Notes" />
          <Input
            value={form.notes}
            onChangeText={(text) => updateForm({ notes: text })}
            placeholder="Anything else you want to remember..."
            multiline
            maxLength={1000}
            numberOfLines={4}
            containerStyle={styles.inputContainer}
          />

          {/* Attach Image */}
          <SectionLabel label="Attach Image" />
          {form.imageUri ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: form.imageUri }} style={styles.previewImg} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => updateForm({ imageUri: null })}
              >
                <X color={colors.textPrimary} size={16} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage}>
              {!imageAd.isUnlocked && <Lock size={16} color={colors.textSecondary} />}
              <Camera size={16} color={colors.textSecondary} />
              <Text style={styles.attachText}>
                {imageAd.isUnlocked ? 'Attach Image' : 'Watch ad to unlock image'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Attach Audio */}
          <SectionLabel label="Attach Audio" />
          {form.audioUri ? (
            <View style={styles.attachBtn}>
              <Mic size={16} color={colors.neonGreen} />
              <Text style={styles.attachText}>Audio attached</Text>
              <TouchableOpacity onPress={() => updateForm({ audioUri: null })} style={styles.removeSmall}>
                <X color={colors.textSecondary} size={14} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={() => {
                if (!audioAd.isUnlocked) {
                  audioAd.watchAd();
                  return;
                }
                Alert.alert('Audio recording', 'Audio recording UI coming soon.');
              }}
            >
              {!audioAd.isUnlocked && <Lock size={16} color={colors.textSecondary} />}
              <Mic size={16} color={colors.textSecondary} />
              <Text style={styles.attachText}>
                {audioAd.isUnlocked ? 'Record Audio' : 'Watch ad to unlock audio'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Share with Pack */}
          {userDoc?.packId && (
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Share with Pack</Text>
              <Switch
                value={form.isSharedWithPack}
                onValueChange={(val) => updateForm({ isSharedWithPack: val })}
                trackColor={{ false: colors.border, true: `${colors.neonGreen}55` }}
                thumbColor={form.isSharedWithPack ? colors.neonGreen : colors.textDisabled}
              />
            </View>
          )}

          {/* Submit */}
          <Button
            label={saving ? 'Saving...' : editingShift ? 'Update Shift' : 'Save Shift'}
            onPress={handleSubmit}
            loading={saving}
            fullWidth
            style={styles.submitBtn}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.bgSurface,
  },
  handle: {
    backgroundColor: colors.border,
    width: 40,
  },
  content: {
    paddingBottom: 60,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontFamily: 'Cinzel_400Regular',
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_500Medium',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  inputContainer: {
    marginHorizontal: spacing.md,
  },
  charCount: {
    color: colors.textDisabled,
    fontSize: fontSizes.xs,
    fontFamily: 'JetBrainsMono_400Regular',
    textAlign: 'right',
    paddingHorizontal: spacing.md,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
  },
  attachText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
  },
  imagePreview: {
    marginHorizontal: spacing.md,
    position: 'relative',
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  previewImg: {
    width: '100%',
    height: 180,
    borderRadius: radii.md,
  },
  removeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: `${colors.black}88`,
    borderRadius: radii.pill,
    padding: spacing.xs,
  },
  removeSmall: {
    marginLeft: 'auto',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontFamily: 'DMSans_400Regular',
  },
  submitBtn: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
});
