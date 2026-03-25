import React, { useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, Users, UserCircle, Plus } from 'lucide-react-native';
import type BottomSheet from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontSizes, radii } from '@/constants/theme';
import { NewShiftSheet } from '@/components/shift/NewShiftSheet';
import { useShifts } from '@/hooks/useShifts';
import { usePack } from '@/hooks/usePack';

const TABS = [
  { name: 'index', title: 'Home', Icon: Home },
  { name: 'journal', title: 'Journal', Icon: BookOpen },
  { name: 'pack', title: 'Pack', Icon: Users },
  { name: 'profile', title: 'Me', Icon: UserCircle },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);

  // Activate global data subscriptions at the tab level
  useShifts();
  usePack();

  const handleNewShift = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sheetRef.current?.expand();
  }, []);

  const tabItems = [
    TABS[0], // Home
    TABS[1], // Journal
    null,    // Center button placeholder
    TABS[2], // Pack
    TABS[3], // Me
  ];

  // Compute which route index maps to which tab
  // state.routes: index, journal, pack, profile (no new-shift)
  const routeNames = state.routes.map((r: any) => r.name);

  return (
    <>
      <BlurView
        intensity={40}
        tint="dark"
        style={[
          styles.tabBar,
          { paddingBottom: insets.bottom || spacing.sm },
        ]}
      >
        {tabItems.map((tab, i) => {
          if (!tab) {
            // Center button
            return (
              <TouchableOpacity
                key="new-shift"
                style={styles.centerBtn}
                onPress={handleNewShift}
                activeOpacity={0.85}
              >
                <View style={styles.centerBtnInner}>
                  <Plus color={colors.black} size={28} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            );
          }

          const routeIndex = routeNames.indexOf(tab.name);
          const isFocused = routeIndex !== -1 && state.index === routeIndex;
          const { Icon } = tab;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[routeIndex]?.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
            >
              {isFocused && <View style={styles.activeDot} />}
              <Icon
                size={22}
                color={isFocused ? colors.neonGreen : colors.textDisabled}
                strokeWidth={isFocused ? 2 : 1.5}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>

      {/* New Shift bottom sheet mounted at tab layout level */}
      <NewShiftSheet
        ref={sheetRef}
        onClose={() => sheetRef.current?.close()}
      />
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="journal" />
      <Tabs.Screen name="pack" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    backgroundColor: `${colors.bgPrimary}CC`,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    gap: 2,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: -spacing.sm - 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neonGreen,
  },
  tabLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'DMSans_400Regular',
    color: colors.textDisabled,
  },
  tabLabelActive: {
    color: colors.neonGreen,
    fontFamily: 'DMSans_500Medium',
  },
  centerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xs,
  },
  centerBtnInner: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    marginTop: -20,
  },
});
