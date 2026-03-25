import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSizes } from '@/constants/theme';

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

function getTrackColor(value: number): string {
  if (value <= 4) return colors.neonGreen;
  if (value <= 7) return colors.neonViolet;
  return colors.danger;
}

export function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const lastHapticValue = useRef<number>(value);

  const handleChange = (vals: number | number[]) => {
    const newVal = Math.round(Array.isArray(vals) ? vals[0] : vals);
    if (newVal !== lastHapticValue.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticValue.current = newVal;
    }
    onChange(newVal);
  };

  const trackColor = getTrackColor(value);

  return (
    <View style={styles.container}>
      <Text style={[styles.valueDisplay, { color: trackColor }]}>{value}</Text>
      <View style={styles.labels}>
        <Text style={styles.labelText}>Calm</Text>
        <Text style={styles.labelText}>Intense</Text>
      </View>
      <Slider
        value={value}
        onValueChange={handleChange}
        minimumValue={0}
        maximumValue={10}
        step={1}
        minimumTrackTintColor={trackColor}
        maximumTrackTintColor={colors.border}
        thumbTintColor={trackColor}
        trackStyle={styles.track}
        thumbStyle={styles.thumb}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  valueDisplay: {
    fontSize: 56,
    fontFamily: 'JetBrainsMono_400Regular',
    textAlign: 'center',
    lineHeight: 72,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  labelText: {
    color: colors.textDisabled,
    fontSize: fontSizes.xs,
    fontFamily: 'DMSans_400Regular',
  },
  track: {
    height: 6,
    borderRadius: 3,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
});
