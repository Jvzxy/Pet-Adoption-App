const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    plugins: [
      ...appJson.expo.plugins,
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
          faceIDPermission: 'Allow Pawfect Cats to use Face ID to confirm payments.',
        },
      ],
    ],
  },
};
