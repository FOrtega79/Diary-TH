import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ShiftCard } from '@/components/shift/ShiftCard';
import { colors, spacing, fontSizes, radii } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { usePackStore } from '@/store/packStore';
import { createPack, inviteMember } from '@/services/pack';

export default function PackScreen() {
  const { user, userDoc } = useAuthStore();
  const { pack, members, sharedShifts, isLoading } = usePackStore();
  const [creating, setCreating] = useState(false);
  const [packName, setPackName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteInput, setShowInviteInput] = useState(false);

  const handleCreatePack = async () => {
    if (!packName.trim() || !user) return;
    setCreating(true);
    try {
      await createPack(user.uid, packName.trim());
      Toast.show({ type: 'success', text1: `Pack "${packName}" created!` });
      setPackName('');
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to create pack.' });
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!pack || !user || !inviteEmail.trim()) return;
    try {
      await inviteMember(pack.id, user.uid, inviteEmail.trim());
      Toast.show({ type: 'success', text1: `Invite sent to ${inviteEmail}` });
      setInviteEmail('');
      setShowInviteInput(false);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to send invite.' });
    }
  };

  if (isLoading) return <LoadingScreen />;

  // No pack — show create/join UI
  if (!pack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Pack</Text>
        </View>
        <View style={styles.noPack}>
          <Text style={styles.noPackEmoji}>🌿</Text>
          <Text style={styles.noPackTitle}>You're not in a pack yet</Text>
          <Text style={styles.noPackSub}>
            Create a pack and invite trusted friends to share your journey.
          </Text>

          <View style={styles.createForm}>
            <TextInput
              value={packName}
              onChangeText={setPackName}
              placeholder="Pack name..."
              placeholderTextColor={colors.textDisabled}
              style={styles.nameInput}
            />
            <Button
              label={creating ? 'Creating...' : 'Create a Pack'}
              onPress={handleCreatePack}
              loading={creating}
              disabled={!packName.trim()}
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Has pack
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Pack header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{pack.name}</Text>
            <Text style={styles.memberCount}>{members.length} members</Text>
          </View>
          <TouchableOpacity
            style={styles.inviteBtn}
            onPress={() => setShowInviteInput(!showInviteInput)}
          >
            <UserPlus size={20} color={colors.neonGreen} />
          </TouchableOpacity>
        </View>

        {/* Invite input */}
        {showInviteInput && (
          <Card style={styles.inviteForm}>
            <TextInput
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Friend's email address"
              placeholderTextColor={colors.textDisabled}
              style={styles.inviteInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button label="Send Invite" onPress={handleInvite} size="sm" />
          </Card>
        )}

        {/* Members */}
        <Text style={styles.sectionTitle}>Members</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.membersRow}>
            {members.map((m) => (
              <View key={m.uid} style={styles.memberItem}>
                <Avatar uri={m.avatarUrl} name={m.displayName} size={52} neonBorder />
                <Text style={styles.memberName} numberOfLines={1}>{m.displayName}</Text>
                {m.therianType && (
                  <Text style={styles.memberType}>{m.therianType}</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Shared shifts feed */}
        <Text style={styles.sectionTitle}>Pack Shifts</Text>
        {sharedShifts.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              No shared shifts yet. Toggle "Share with Pack" when logging a shift.
            </Text>
          </Card>
        ) : (
          sharedShifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} onPress={() => {}} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: spacing.md, gap: spacing.lg, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
  },
  memberCount: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
    marginTop: spacing.xs,
  },
  inviteBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  noPackEmoji: { fontSize: 64 },
  noPackTitle: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  noPackSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  createForm: {
    width: '100%',
    gap: spacing.md,
  },
  nameInput: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontFamily: 'DMSans_400Regular',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inviteForm: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  inviteInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
  },
  sectionTitle: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  membersRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  memberItem: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 68,
  },
  memberName: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  memberType: {
    color: colors.textDisabled,
    fontSize: fontSizes.xs - 1,
    fontFamily: 'JetBrainsMono_400Regular',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    padding: spacing.md,
  },
});
