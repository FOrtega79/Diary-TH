import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Lock, LogOut } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, fontSizes, radii } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useShiftStore } from '@/store/shiftStore';
import { useProGate } from '@/hooks/useProGate';
import { signOut } from '@/services/auth';
import { storage, db } from '@/services/firebase';
import { THERIAN_TYPES } from '@/constants/therianTypes';

export default function ProfileScreen() {
  const { user, userDoc, isPro } = useAuthStore();
  const { shifts } = useShiftStore();
  const { checkPro } = useProGate();
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(userDoc?.bio ?? '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const displayName = userDoc?.displayName ?? user?.displayName ?? 'Therian';
  const primaryType = THERIAN_TYPES.find((t) => t.id === userDoc?.therianType);
  const secondaryType = THERIAN_TYPES.find((t) => t.id === userDoc?.therianTypeSecondary);

  const longestStreak = userDoc?.streakCount ?? 0;
  const totalShifts = shifts.length;

  const handleAvatarPress = () => {
    checkPro(async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && user) {
        setUploadingAvatar(true);
        try {
          const response = await fetch(result.assets[0].uri);
          const blob = await response.blob();
          const storageRef = ref(storage, `avatars/${user.uid}.jpg`);
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          await updateDoc(doc(db, 'users', user.uid), { avatarUrl: url });
          Toast.show({ type: 'success', text1: 'Avatar updated!' });
        } catch {
          Toast.show({ type: 'error', text1: 'Failed to update avatar.' });
        } finally {
          setUploadingAvatar(false);
        }
      }
    });
  };

  const handleSaveBio = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { bio: bioText });
      setEditingBio(false);
      Toast.show({ type: 'success', text1: 'Bio updated!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save bio.' });
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar
              uri={userDoc?.avatarUrl}
              name={displayName}
              size={120}
              neonBorder
            />
            <TouchableOpacity
              style={[styles.editAvatarBtn, !isPro && styles.editAvatarBtnLocked]}
              onPress={handleAvatarPress}
              disabled={uploadingAvatar}
            >
              {isPro ? (
                <Camera size={16} color={colors.textPrimary} />
              ) : (
                <Lock size={16} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
        </View>

        {/* Therian type badges */}
        <View style={styles.typesRow}>
          {primaryType && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeEmoji}>{primaryType.emoji}</Text>
              <Text style={styles.typeLabel}>{primaryType.label}</Text>
            </View>
          )}
          {secondaryType && isPro && (
            <View style={[styles.typeBadge, styles.typeBadgeSecondary]}>
              <Text style={styles.typeEmoji}>{secondaryType.emoji}</Text>
              <Text style={[styles.typeLabel, styles.typeLabelSecondary]}>
                {secondaryType.label}
              </Text>
            </View>
          )}
        </View>

        {/* Bio */}
        <Card style={styles.bioCard}>
          <View style={styles.bioHeader}>
            <Text style={styles.sectionLabel}>Bio</Text>
            {isPro ? (
              <TouchableOpacity onPress={() => setEditingBio(!editingBio)}>
                <Text style={styles.editLink}>{editingBio ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => checkPro(() => {})}>
                <View style={styles.proLock}>
                  <Lock size={12} color={colors.neonViolet} />
                  <Text style={styles.proLockText}>Pro</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          {editingBio ? (
            <View style={styles.bioEditContainer}>
              <TextInput
                value={bioText}
                onChangeText={setBioText}
                placeholder="Tell your pack about yourself..."
                placeholderTextColor={colors.textDisabled}
                style={styles.bioInput}
                multiline
                maxLength={200}
                autoFocus
              />
              <View style={styles.bioActions}>
                <Text style={styles.charCount}>{bioText.length}/200</Text>
                <Button label="Save" onPress={handleSaveBio} size="sm" />
              </View>
            </View>
          ) : (
            <Text style={styles.bioText}>
              {userDoc?.bio || (isPro ? 'Tap Edit to add your bio.' : 'Upgrade to Pro to add a bio.')}
            </Text>
          )}
        </Card>

        {/* Stats */}
        <Card>
          <View style={styles.statsRow}>
            <StatItem label="Total Shifts" value={String(totalShifts)} />
            <View style={styles.statDivider} />
            <StatItem label="Longest Streak" value={`${longestStreak}d`} />
            <View style={styles.statDivider} />
            <StatItem label="Days Active" value={String(longestStreak)} />
          </View>
        </Card>

        {/* Pro banner */}
        {!isPro ? (
          <TouchableOpacity
            style={styles.proBanner}
            onPress={() => checkPro(() => {})}
            activeOpacity={0.85}
          >
            <Text style={styles.proBannerText}>✦ Unlock Therian Diary Pro</Text>
            <Text style={styles.proBannerSub}>
              Avatar editing · Dual therian types · Bio · Analytics
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.proMember}>
            <Text style={styles.proMemberText}>✦ Pro Member</Text>
          </View>
        )}

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={16} color={colors.textSecondary} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: spacing.md, gap: spacing.lg, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', gap: spacing.md },
  avatarWrapper: { position: 'relative' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtnLocked: {
    borderColor: colors.border,
  },
  displayName: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
  },
  typesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.neonGreen}15`,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  typeBadgeSecondary: {
    backgroundColor: `${colors.neonViolet}15`,
    borderColor: colors.neonViolet,
  },
  typeEmoji: { fontSize: 18 },
  typeLabel: {
    color: colors.neonGreen,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_500Medium',
  },
  typeLabelSecondary: { color: colors.neonViolet },
  bioCard: {},
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  editLink: {
    color: colors.neonGreen,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_500Medium',
  },
  proLock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${colors.neonViolet}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.neonViolet,
  },
  proLockText: {
    color: colors.neonViolet,
    fontSize: fontSizes.xs,
    fontFamily: 'DMSans_500Medium',
  },
  bioText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 22,
  },
  bioEditContainer: { gap: spacing.sm },
  bioInput: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontFamily: 'DMSans_400Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bioActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    color: colors.textDisabled,
    fontSize: fontSizes.xs,
    fontFamily: 'JetBrainsMono_400Regular',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statValue: {
    color: colors.neonGreen,
    fontSize: fontSizes.xl,
    fontFamily: 'Cinzel_700Bold',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  proBanner: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.neonViolet,
    padding: spacing.lg,
    gap: spacing.xs,
    shadowColor: colors.neonViolet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  proBannerText: {
    color: colors.neonViolet,
    fontSize: fontSizes.md,
    fontFamily: 'Cinzel_400Regular',
    textAlign: 'center',
  },
  proBannerSub: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  proMember: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  proMemberText: {
    color: colors.neonGreen,
    fontSize: fontSizes.md,
    fontFamily: 'Cinzel_400Regular',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  signOutText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    fontFamily: 'DMSans_400Regular',
  },
});
