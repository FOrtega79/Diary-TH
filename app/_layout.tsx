import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@shopify/restyle';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Cinzel_400Regular,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import Toast from 'react-native-toast-message';

import theme, { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useSubscription } from '@/hooks/useSubscription';
import { initRevenueCat } from '@/services/revenuecat';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

const REVENUECAT_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

function RootLayoutInner() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isInitialized, isLoading } = useAuthStore();
  useAuth();
  useSubscription();

  useEffect(() => {
    if (!isInitialized) return;

    const redirect = async () => {
      const inAuthGroup = segments[0] === '(auth)';
      const inOnboarding = segments[0] === 'onboarding';

      if (user) {
        if (inAuthGroup || inOnboarding) {
          router.replace('/(tabs)');
        }
      } else {
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!seen) {
          if (!inOnboarding) router.replace('/onboarding');
        } else {
          if (!inAuthGroup) router.replace('/(auth)/login');
        }
      }
    };

    redirect();
  }, [user, isInitialized]);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized, isLoading]);

  if (!isInitialized) return <LoadingScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <OfflineBanner />
      <Slot />
      <PaywallModal />
      <Toast />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
  });

  useEffect(() => {
    if (REVENUECAT_KEY) {
      initRevenueCat(REVENUECAT_KEY);
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <RootLayoutInner />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
