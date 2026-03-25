import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { colors, spacing, radii, fontSizes } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  containerStyle,
  rightElement,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, focused && styles.labelFocused]}>
          {label}
        </Text>
      )}
      <View style={[styles.inputWrapper, focused ? styles.inputWrapperFocused : undefined, error ? styles.inputWrapperError : undefined]}>
        <TextInput
          {...props}
          style={[styles.input, props.style]}
          placeholderTextColor={colors.textDisabled}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
        />
        {rightElement}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  labelFocused: {
    color: colors.neonGreen,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: colors.neonGreen,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontFamily: 'DMSans_400Regular',
    minHeight: 24,
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.danger,
    fontFamily: 'DMSans_400Regular',
  },
});
