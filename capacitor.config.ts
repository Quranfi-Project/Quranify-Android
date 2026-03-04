import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quranfy.app',
  appName: 'Quranfi',
  webDir: 'dist',
  android: {
       buildOptions: {
          keystorePath: '/home/canadiangamer/Documents/quranfi-release-key.jks',
          keystoreAlias: 'quranfi',
          signingType: 'jarsigner',
       }
    }
  };

export default config;
