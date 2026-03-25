import React from 'react';
import { ViewStyle, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  neonBorder?: boolean;
  glow?: boolean;
}

export function Card({ children, style, neonBorder = true, glow = false }: CardProps) {
  return (
    <View style={[styles.card, neonBorder && styles.neonBorder, glow && styles.glow, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  neonBorder: {
    borderColor: colors.border,
  },
  glow: {
    borderColor: colors.neonGreen,
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
