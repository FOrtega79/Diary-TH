import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, Pencil } from 'lucide-react-native';
import type BottomSheet from '@gorhom/bottom-sheet';

import { ShiftCard } from '@/components/shift/ShiftCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { NewShiftSheet } from '@/components/shift/NewShiftSheet';
import { colors, spacing, fontSizes, radii } from '@/constants/theme';
import { useShiftStore } from '@/store/shiftStore';
import { ShiftDoc, ShiftFilter } from '@/types';
import { deleteShift } from '@/services/shifts';
import { useAuthStore } from '@/store/authStore';
import { isThisWeek, isThisMonth } from 'date-fns';
import { toDate } from '@/utils/dateHelpers';
import Toast from 'react-native-toast-message';

const FILTERS: { id: ShiftFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

export default function JournalScreen() {
  const { shifts, isLoading, removeShift } = useShiftStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<ShiftFilter>('all');
  const [editingShift, setEditingShift] = useState<ShiftDoc | null>(null);
  const editSheetRef = useRef<BottomSheet>(null);

  const filteredShifts = shifts.filter((s) => {
    if (filter === 'all') return true;
    const date = toDate(s.createdAt);
    if (!date) return false;
    if (filter === 'week') return isThisWeek(date, { weekStartsOn: 1 });
    if (filter === 'month') return isThisMonth(date);
    return true;
  });

  const handleDelete = (shift: ShiftDoc) => {
    Alert.alert('Delete Shift', 'This shift will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteShift(shift);
            removeShift(shift.id);
            Toast.show({ type: 'success', text1: 'Shift deleted.' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete shift.' });
          }
        },
      },
    ]);
  };

  const handleEdit = (shift: ShiftDoc) => {
    setEditingShift(shift);
    editSheetRef.current?.expand();
  };

  if (isLoading && shifts.length === 0) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Journal</Text>
      </View>

      {/* Filter bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Shift list */}
      <FlatList
        data={filteredShifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ShiftCard shift={item} onPress={() => {}} />
            {/* Swipe-like action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionEdit]}
                onPress={() => handleEdit(item)}
              >
                <Pencil size={16} color={colors.neonViolet} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionDelete]}
                onPress={() => handleDelete(item)}
              >
                <Trash2 size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={[
          styles.list,
          filteredShifts.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <EmptyState
            title="No shifts logged yet"
            subtitle="How are you feeling today?"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Edit bottom sheet */}
      <NewShiftSheet
        ref={editSheetRef}
        editingShift={editingShift}
        onClose={() => {
          editSheetRef.current?.close();
          setEditingShift(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  filterChipActive: {
    borderColor: colors.neonGreen,
    backgroundColor: `${colors.neonGreen}15`,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
  },
  filterTextActive: {
    color: colors.neonGreen,
    fontFamily: 'DMSans_500Medium',
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
  },
  cardWrapper: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionEdit: {
    borderColor: colors.neonViolet,
    backgroundColor: `${colors.neonViolet}15`,
  },
  actionDelete: {
    borderColor: colors.danger,
    backgroundColor: `${colors.danger}15`,
  },
});
