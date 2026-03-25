import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import { SHIFT_TYPES } from '@/constants/shiftTypes';
import { colors, radii, spacing, fontSizes } from '@/constants/theme';

interface ShiftTypeSelectorProps {
  value: string;
  customValue: string;
  onChange: (type: string, custom: string) => void;
}

export function ShiftTypeSelector({ value, customValue, onChange }: ShiftTypeSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(value === 'custom');

  const handleSelect = (id: string) => {
    if (id === 'custom') {
      setShowCustomInput(true);
      onChange('custom', customValue);
    } else {
      setShowCustomInput(false);
      onChange(id, '');
    }
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SHIFT_TYPES.map((type) => {
          const isSelected = value === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              onPress={() => handleSelect(type.id)}
              style={[
                styles.chip,
                isSelected && { backgroundColor: `${type.color}22`, borderColor: type.color },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && { color: type.color },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {showCustomInput && (
        <TextInput
          value={customValue}
          onChangeText={(text) => onChange('custom', text)}
          placeholder="Name your shift type..."
          placeholderTextColor={colors.textDisabled}
          style={styles.customInput}
          maxLength={50}
          autoFocus
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_500Medium',
  },
  customInput: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontFamily: 'DMSans_400Regular',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
});
