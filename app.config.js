module.exports = ({ config }) => ({
  ...config,
  name: 'Therian Diary',
  slug: 'therian-diary',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'therianDiary',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0D0F',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.therianDiary.app',
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      NSMicrophoneUsageDescription: 'Used to record audio diary entries',
      NSPhotoLibraryUsageDescription: 'Used to attach images to diary entries',
      NSCameraUsageDescription: 'Used to capture images for diary entries',
      GADApplicationIdentifier: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0D0F',
    },
    package: 'com.therianDiary.app',
    permissions: ['RECORD_AUDIO', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'VIBRATE'],
  },
  web: { bundler: 'metro', output: 'static' },
  plugins: [
    'expo-dev-client',
    'expo-router',
    'expo-font',
    ['expo-image-picker', { photosPermission: 'Allow Therian Diary to access your photos for diary entries.' }],
    ['expo-av', { microphonePermission: 'Allow Therian Diary to record audio for diary entries.' }],
    ['expo-notifications', { icon: './assets/notification-icon.png', color: '#39FF8A', sounds: [] }],
    ['expo-build-properties', { android: { minSdkVersion: 24 } }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    eas: { projectId: '88f1e7d2-29e9-4fa2-b5cd-10b0bb305e1d' },
  },
});
