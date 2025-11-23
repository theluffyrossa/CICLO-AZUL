// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

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
    },
    android: {
      package: 'com.cicloazul.app',
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
    },
    web: {},
    extra: {
      eas: {
        projectId: 'dddce50c-f078-4626-b7f4-e354d1521180',
      },
      apiUrl: process.env.API_URL || 'http://localhost:3000/api',
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  },
};
