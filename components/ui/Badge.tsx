import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, fontSizes } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
  small?: boolean;
}

export function Badge({ label, color = colors.neonGreen, style, small = false }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        small && styles.small,
        { borderColor: color, backgroundColor: `${color}22` },
        style,
      ]}
    >
      <Text style={[styles.text, small && styles.smallText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  text: {
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_500Medium',
  },
  smallText: {
    fontSize: fontSizes.xs,
  },
});
