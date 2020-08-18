module.exports = {
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: true,
    },
    electronBuilder: {
      nodeIntegration: true,
      preload: 'src/preload.js',
      builderOptions: {
        mac: {
          darkModeSupport: true,
          hardenedRuntime: false,
          category: 'public.app-category.communications',
          entitlements: 'entitlements.mac.plist',
          entitlementsInherit: 'entitlements.mac.plist',
          extendInfo: {
            NSCameraUsageDescription: 'InfinityOne requires access to your camera in order to make video-calls.',
            NSMicrophoneUsageDescription: 'InfinityOne requires access to your microphone in order to make calls (audio/video).',
          },
        }
      },
    },
    devServer: {
      disableHostCheck: true
    }
  },
  transpileDependencies: [
    "vuetify"
  ],
}