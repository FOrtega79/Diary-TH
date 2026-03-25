import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSizes, radii } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  syncProStatus,
} from '@/services/revenuecat';
import type { PurchasesPackage } from 'react-native-purchases';

const PRO_FEATURES = [
  'Secondary therian type selection',
  'Edit your profile bio',
  'Upload & change avatar',
  'Advanced journal analytics (coming soon)',
  'Priority support',
];

export function PaywallModal() {
  const { paywallVisible, setPaywallVisible, user, setIsPro } = useAuthStore();
  const [offerings, setOfferings] = useState<any>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    if (paywallVisible) {
      setLoadingOfferings(true);
      getOfferings().then((o) => {
        setOfferings(o);
        setLoadingOfferings(false);
      });
    }
  }, [paywallVisible]);

  const handlePurchase = async () => {
    if (!selectedPkg || !user) return;
    setPurchasing(true);
    try {
      const isPro = await purchasePackage(selectedPkg);
      if (isPro) {
        setIsPro(true);
        await syncProStatus(user.uid, true);
        Toast.show({ type: 'success', text1: 'Welcome to Pro! 🎉' });
        setPaywallVisible(false);
      }
    } catch (err: any) {
      if (!err.userCancelled) {
        Toast.show({ type: 'error', text1: 'Purchase failed. Try again.' });
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!user) return;
    try {
      const isPro = await restorePurchases();
      if (isPro) {
        setIsPro(true);
        await syncProStatus(user.uid, true);
        Toast.show({ type: 'success', text1: 'Pro access restored!' });
        setPaywallVisible(false);
      } else {
        Toast.show({ type: 'info', text1: 'No active Pro subscription found.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to restore. Try again.' });
    }
  };

  const packages = offerings?.current?.availablePackages ?? [];
  const monthlyPkg = packages.find((p: PurchasesPackage) => p.packageType === 'MONTHLY');
  const yearlyPkg = packages.find((p: PurchasesPackage) => p.packageType === 'ANNUAL');

  return (
    <Modal
      visible={paywallVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setPaywallVisible(false)}
    >
      <LinearGradient
        colors={['#0A0D0F', '#0D0A1A', '#0A0D0F']}
        style={styles.container}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPaywallVisible(false)}
            >
              <X color={colors.textSecondary} size={24} />
            </TouchableOpacity>

            {/* Header */}
            <Text style={styles.logo}>🐺</Text>
            <Text style={styles.title}>Unlock Your Full Potential</Text>
            <Text style={styles.subtitle}>
              Join the full Therian Diary experience
            </Text>

            {/* Features */}
            <View style={styles.features}>
              {PRO_FEATURES.map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.checkCircle}>
                    <Check size={14} color={colors.neonGreen} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            {loadingOfferings ? (
              <ActivityIndicator color={colors.neonGreen} />
            ) : (
              <View style={styles.pricingRow}>
                {/* Monthly */}
                {monthlyPkg && (
                  <TouchableOpacity
                    style={[
                      styles.pricingCard,
                      selectedPkg?.identifier === monthlyPkg.identifier && styles.pricingCardSelected,
                    ]}
                    onPress={() => setSelectedPkg(monthlyPkg)}
                  >
                    <Text style={styles.pricingPeriod}>Monthly</Text>
                    <Text style={styles.pricingPrice}>
                      {monthlyPkg.product.priceString}
                    </Text>
                    <Text style={styles.pricingPeriodLabel}>/ month</Text>
                  </TouchableOpacity>
                )}

                {/* Yearly — highlighted */}
                {yearlyPkg && (
                  <TouchableOpacity
                    style={[
                      styles.pricingCard,
                      styles.pricingCardHighlight,
                      selectedPkg?.identifier === yearlyPkg.identifier && styles.pricingCardSelected,
                    ]}
                    onPress={() => setSelectedPkg(yearlyPkg)}
                  >
                    <View style={styles.bestValueBadge}>
                      <Text style={styles.bestValueText}>Best Value</Text>
                    </View>
                    <Text style={styles.pricingPeriod}>Yearly</Text>
                    <Text style={styles.pricingPrice}>
                      {yearlyPkg.product.priceString}
                    </Text>
                    <Text style={styles.pricingPeriodLabel}>/ year · Save 42%</Text>
                  </TouchableOpacity>
                )}

                {/* Fallback if no offerings */}
                {!monthlyPkg && !yearlyPkg && (
                  <Text style={styles.noOfferings}>
                    Pricing unavailable. Check your connection.
                  </Text>
                )}
              </View>
            )}

            {/* CTA */}
            <Button
              label={purchasing ? 'Processing...' : 'Start Pro'}
              onPress={handlePurchase}
              loading={purchasing}
              disabled={!selectedPkg}
              fullWidth
              style={styles.ctaBtn}
            />

            {/* Restore */}
            <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: spacing.sm,
  },
  logo: { fontSize: 64 },
  title: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.neonGreen}20`,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontFamily: 'DMSans_400Regular',
  },
  pricingRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  pricingCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  pricingCardHighlight: {
    borderColor: colors.neonViolet,
    backgroundColor: `${colors.neonViolet}15`,
  },
  pricingCardSelected: {
    borderColor: colors.neonGreen,
    borderWidth: 2,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.neonViolet,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: radii.sm,
  },
  bestValueText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontFamily: 'DMSans_500Medium',
  },
  pricingPeriod: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontFamily: 'Cinzel_400Regular',
    marginTop: spacing.lg,
  },
  pricingPrice: {
    color: colors.textPrimary,
    fontSize: fontSizes.xl,
    fontFamily: 'Cinzel_700Bold',
  },
  pricingPeriodLabel: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontFamily: 'DMSans_400Regular',
  },
  noOfferings: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    flex: 1,
  },
  ctaBtn: {
    width: '100%',
  },
  restoreBtn: { padding: spacing.sm },
  restoreText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
    textDecorationLine: 'underline',
  },
});
