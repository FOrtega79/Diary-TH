import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Flame } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { ShiftCard } from '@/components/shift/ShiftCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, spacing, fontSizes, radii } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useShiftStore } from '@/store/shiftStore';
import { usePackStore } from '@/store/packStore';
import { useStreak } from '@/hooks/useStreak';
import { getGreeting } from '@/utils/dateHelpers';
import { Avatar as AvatarComp } from '@/components/ui/Avatar';

export default function HomeScreen() {
  const router = useRouter();
  const { user, userDoc } = useAuthStore();
  const { shifts } = useShiftStore();
  const { pack, members } = usePackStore();
  const { streakCount, lastShiftRelative } = useStreak();

  const greeting = getGreeting();
  const displayName = userDoc?.displayName ?? user?.displayName ?? 'friend';
  const latestShift = shifts[0] ?? null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {greeting},
            </Text>
            <Text style={styles.name}>{displayName}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Avatar
              uri={userDoc?.avatarUrl}
              name={displayName}
              size={44}
              neonBorder
            />
          </TouchableOpacity>
        </View>

        {/* Streak Card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <LinearGradient
            colors={['#111916', '#1A2E1F']}
            style={styles.streakCard}
          >
            <View style={styles.streakGlowBar} />
            <View style={styles.streakContent}>
              <Flame color={colors.warning} size={40} />
              <View style={styles.streakText}>
                <Text style={styles.streakCount}>{streakCount}</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
              </View>
            </View>
            <Text style={styles.streakSub}>Last shift: {lastShiftRelative}</Text>
          </LinearGradient>
        </MotiView>

        {/* Quick action — Log a shift */}
        <TouchableOpacity
          style={styles.quickAction}
          activeOpacity={0.85}
          onPress={() => {}}
        >
          <View style={styles.quickActionIcon}>
            <Zap color={colors.neonGreen} size={24} />
          </View>
          <View style={styles.quickActionText}>
            <Text style={styles.quickActionTitle}>Log a New Shift</Text>
            <Text style={styles.quickActionSub}>How are you feeling right now?</Text>
          </View>
        </TouchableOpacity>

        {/* Latest shift */}
        <Text style={styles.sectionTitle}>Latest Shift</Text>
        {latestShift ? (
          <ShiftCard
            shift={latestShift}
            onPress={() => {}}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No shifts logged yet. Tap + to start!</Text>
          </Card>
        )}

        {/* Pack widget */}
        <Text style={styles.sectionTitle}>Your Pack</Text>
        {pack ? (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.membersRow}>
                {members.map((m) => (
                  <View key={m.uid} style={styles.memberItem}>
                    <AvatarComp uri={m.avatarUrl} name={m.displayName} size={44} neonBorder />
                    <Text style={styles.memberName} numberOfLines={1}>{m.displayName}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <Card>
            <Text style={styles.emptyText}>No pack yet. Head to Pack to create or join one.</Text>
          </Card>
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
    alignItems: 'center',
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    fontFamily: 'DMSans_400Regular',
  },
  name: {
    color: colors.textPrimary,
    fontSize: fontSizes.xl,
    fontFamily: 'Cinzel_700Bold',
  },
  streakCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  streakGlowBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.neonGreen,
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakText: { gap: 2 },
  streakCount: {
    color: colors.textPrimary,
    fontSize: fontSizes.display,
    fontFamily: 'Cinzel_700Bold',
    lineHeight: 56,
  },
  streakLabel: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakSub: {
    color: colors.textDisabled,
    fontSize: fontSizes.xs,
    fontFamily: 'JetBrainsMono_400Regular',
    marginTop: spacing.sm,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    padding: spacing.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: `${colors.neonGreen}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: { gap: 2 },
  quickActionTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontFamily: 'DMSans_500Medium',
  },
  quickActionSub: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontFamily: 'Cinzel_400Regular',
  },
  emptyCard: { padding: spacing.lg },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  membersRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  memberItem: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 60,
  },
  memberName: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
});
