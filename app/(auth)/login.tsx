import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSizes } from '@/constants/theme';
import { signInWithEmail, resetPassword, mapFirebaseError } from '@/services/auth';
import { requestNotificationPermission } from '@/services/notifications';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Please enter email and password.' });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      // Auth state change will trigger redirect in _layout.tsx
      // Request notifications on first sign-in
      const uid = user?.uid;
      if (uid) {
        requestNotificationPermission(uid).catch(() => {});
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: mapFirebaseError(err.code),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Enter your email first.' });
      return;
    }
    try {
      await resetPassword(email.trim());
      Toast.show({ type: 'success', text1: 'Password reset email sent!' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: mapFirebaseError(err.code) });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Title */}
          <View style={styles.logoArea}>
            <Text style={styles.logo}>🐺</Text>
            <Text style={styles.appName}>Therian Diary</Text>
            <Text style={styles.tagline}>Your sacred digital space</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              rightElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <EyeOff size={18} color={colors.textSecondary} />
                    : <Eye size={18} color={colors.textSecondary} />
                  }
                </TouchableOpacity>
              }
            />

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotLink}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
              fullWidth
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              label="Continue with Google"
              onPress={() => Toast.show({ type: 'info', text1: 'Google Sign-In requires a development build.' })}
              variant="secondary"
              fullWidth
            />
          </View>

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}> Register</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  logoArea: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    fontSize: 64,
  },
  appName: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
  },
  tagline: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  form: {
    gap: spacing.md,
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  linkText: {
    color: colors.neonGreen,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_400Regular',
  },
  footerLink: {
    color: colors.neonGreen,
    fontSize: fontSizes.sm,
    fontFamily: 'DMSans_500Medium',
  },
});
