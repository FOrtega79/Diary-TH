import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, fontSizes } from '@/constants/theme';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  neonBorder?: boolean;
  style?: ViewStyle;
}

export function Avatar({ uri, name, size = 48, neonBorder = false, style }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: neonBorder ? 2 : 0,
    borderColor: neonBorder ? colors.neonGreen : 'transparent',
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}
        />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: colors.neonGreen,
    fontFamily: 'Cinzel_400Regular',
    fontWeight: '600',
  },
});
