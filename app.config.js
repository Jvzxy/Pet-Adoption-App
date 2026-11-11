const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,

    // iOS configuration
    ios: {
      ...appJson.expo.ios,
      supportsTablet: true,
      bundleIdentifier:
        appJson.expo.ios?.bundleIdentifier ||
        'com.jussydurain.petadoption',
      icon: appJson.expo.ios?.icon || './assets/icon.png',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },

    // Android configuration
    android: {
      ...appJson.expo.android,
      package: appJson.expo.android?.package || 'com.jussydurain.petadoption',
    },

    // EAS Update configuration
    updates: {
      ...appJson.expo.updates,
      url: 'https://u.expo.dev/5bcc83e0-70a8-473c-8493-0d07a5e6d6b5',
    },

    runtimeVersion: {
      policy: 'appVersion',
    },

    extra: {
      ...appJson.expo.extra,
      eas: {
        ...appJson.expo.extra?.eas,
        projectId: '5bcc83e0-70a8-473c-8493-0d07a5e6d6b5',
      },
    },

    plugins: [
      ...(appJson.expo.plugins || []),
      'expo-web-browser',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Allow Pawfect Cats to share your live location while you are delivering an order.',
        },
      ],
      [
        'expo-local-authentication',
        {
          faceIDPermission:
            'Allow Pawfect Cats to use Face ID to confirm payments.',
        },
      ],
    ],
  },
};