// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

module.exports = {
  expo: {
    name: 'CICLO AZUL',
    slug: 'ciclo-azul',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.svg',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.svg',
      resizeMode: 'contain',
      backgroundColor: '#0D47A1',
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
      apiUrl: process.env.API_URL || 'http://localhost:3000/api',
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  },
};
