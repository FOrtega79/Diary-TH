import { createTheme } from '@shopify/restyle';

const palette = {
  // Backgrounds
  bgPrimary: '#0A0D0F',
  bgSurface: '#111916',
  bgCard: '#161E1A',

  // Neon accents
  neonGreen: '#39FF8A',
  neonViolet: '#7B5CF0',
  neonCyan: '#00D4FF',

  // Text
  textPrimary: '#E8F0EB',
  textSecondary: '#7A9E85',
  textDisabled: '#3D5243',

  // Borders
  border: '#1F2E24',
  borderActive: '#39FF8A33',

  // Semantic
  danger: '#FF4D6A',
  warning: '#FFB547',
  success: '#39FF8A',

  // Transparent
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
};

const theme = createTheme({
  colors: {
    ...palette,
    // Restyle semantic aliases
    mainBackground: palette.bgPrimary,
    cardBackground: palette.bgCard,
    surfaceBackground: palette.bgSurface,
    primaryText: palette.textPrimary,
    secondaryText: palette.textSecondary,
    disabledText: palette.textDisabled,
    primaryAccent: palette.neonGreen,
    secondaryAccent: palette.neonViolet,
    tertiaryAccent: palette.neonCyan,
    error: palette.danger,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadii: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    pill: 999,
  },
  textVariants: {
    display: {
      fontFamily: 'Cinzel_700Bold',
      fontSize: 48,
      lineHeight: 56,
      color: 'primaryText',
    },
    header: {
      fontFamily: 'Cinzel_400Regular',
      fontSize: 24,
      lineHeight: 32,
      color: 'primaryText',
    },
    subheader: {
      fontFamily: 'CormorantGaramond_600SemiBold',
      fontSize: 20,
      lineHeight: 28,
      color: 'primaryText',
    },
    body: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 15,
      lineHeight: 22,
      color: 'primaryText',
    },
    bodyMedium: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      lineHeight: 22,
      color: 'primaryText',
    },
    label: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      lineHeight: 18,
      color: 'secondaryText',
    },
    caption: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      lineHeight: 16,
      color: 'secondaryText',
    },
    mono: {
      fontFamily: 'JetBrainsMono_400Regular',
      fontSize: 13,
      lineHeight: 18,
      color: 'primaryText',
    },
    defaults: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 15,
      color: 'primaryText',
    },
  },
  breakpoints: {},
});

export type Theme = typeof theme;
export default theme;

// Raw color/spacing values for use outside Restyle
export const colors = palette;
export const spacing = theme.spacing;
export const radii = theme.borderRadii;
export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 32,
  display: 48,
};
