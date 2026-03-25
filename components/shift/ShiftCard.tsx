import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Image as ImageIcon, Mic, Users } from 'lucide-react-native';
import { ShiftDoc } from '@/types';
import { SHIFT_TYPES } from '@/constants/shiftTypes';
import { Badge } from '../ui/Badge';
import { colors, radii, spacing, fontSizes } from '@/constants/theme';
import { formatRelative } from '@/utils/dateHelpers';

interface ShiftCardProps {
  shift: ShiftDoc;
  onPress: () => void;
}

export function ShiftCard({ shift, onPress }: ShiftCardProps) {
  const shiftType = SHIFT_TYPES.find((t) => t.id === shift.shiftType);
  const typeLabel = shift.shiftType === 'custom'
    ? (shift.shiftTypeCustom || 'Custom')
    : (shiftType?.label ?? shift.shiftType);
  const typeColor = shiftType?.color ?? colors.neonGreen;

  const intensityPercent = `${(shift.intensity / 10) * 100}%`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <Badge label={typeLabel} color={typeColor} small />
        <Text style={styles.timestamp}>{formatRelative(shift.createdAt)}</Text>
      </View>

      {/* Intensity bar */}
      <View style={styles.intensityContainer}>
        <View style={styles.intensityTrack}>
          <View
            style={[
              styles.intensityFill,
              { width: intensityPercent as any, backgroundColor: typeColor },
            ]}
          />
        </View>
        <Text style={[styles.intensityLabel, { color: typeColor }]}>{shift.intensity}</Text>
      </View>

      {/* Trigger preview */}
      {shift.trigger ? (
        <Text style={styles.trigger} numberOfLines={2}>{shift.trigger}</Text>
      ) : null}

      {/* Attachments + pack indicator */}
      <View style={styles.footer}>
        <View style={styles.icons}>
          {shift.imageUrl && (
            <ImageIcon size={14} color={colors.textSecondary} />
          )}
          {shift.audioUrl && (
            <Mic size={14} color={colors.textSecondary} />
          )}
        </View>
        {shift.isSharedWithPack && (
          <View style={styles.packBadge}>
            <Users size={12} color={colors.neonCyan} />
            <Text style={styles.packText}>Shared</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    color: colors.textDisabled,
    fontSize: fontSizes.xs,
    fontFamily: 'JetBrainsMono_400Regular',
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  intensityTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 2,
  },
  intensityLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'JetBrainsMono_400Regular',
    width: 20,
    textAlign: 'right',
  },
  trigger: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  icons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  packBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  packText: {
    color: colors.neonCyan,
    fontSize: fontSizes.xs,
    fontFamily: 'DMSans_400Regular',
  },
});
