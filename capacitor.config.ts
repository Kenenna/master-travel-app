import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mastertravelgroup.app',
  appName: 'Master Travel Group',
  webDir: 'dist',
  server: {
    url: 'https://master-travel-app.vercel.app',
    cleartext: false,
  },
};

export default config;