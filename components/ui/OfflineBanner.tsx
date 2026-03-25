import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing, fontSizes } from '@/constants/theme';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  // Simple polling-based connectivity check using fetch
  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      try {
        await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000),
        });
        if (isMounted) setIsOffline(false);
      } catch {
        if (isMounted) setIsOffline(true);
      }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={styles.banner}
    >
      <Text style={styles.text}>Offline — changes will sync when connected</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  text: {
    color: colors.black,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_500Medium',
  },
});
