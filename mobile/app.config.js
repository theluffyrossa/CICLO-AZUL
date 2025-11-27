const path = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env';

require('dotenv').config({ path: path.resolve(__dirname, envFile) });

module.exports = {
  expo: {
    name: 'CICLO AZUL',
    slug: 'ciclo-azul',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/logo.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.cicloazul.app',
      infoPlist: {
        NSPhotoLibraryAddUsageDescription: 'Este aplicativo precisa acessar sua galeria para salvar fotos das coletas.',
        NSPhotoLibraryUsageDescription: 'Este aplicativo precisa acessar sua galeria para salvar fotos das coletas.',
      },
    },
    android: {
      package: 'com.cicloazul.app',
      permissions: [
        'INTERNET',
        'ACCESS_NETWORK_STATE',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
      usesCleartextTraffic: true,
      adaptiveIcon: {
        foregroundImage: './assets/logo.png',
        backgroundColor: '#FFFFFF',
      },
    },
    web: {},
    extra: {
      eas: {
        projectId: 'dddce50c-f078-4626-b7f4-e354d1521180',
      },
      apiUrl: process.env.API_URL || 'http://localhost:3000/api',
      nodeEnv: nodeEnv,
    },
  },
};
