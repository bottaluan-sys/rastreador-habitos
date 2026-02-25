import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rastreador.habitos',
  appName: 'Rastreador de Hábitos',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
