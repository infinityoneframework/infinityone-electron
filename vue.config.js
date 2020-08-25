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
        publish: ['github'],
        copyright: '©2018-2020 E-MetroTel Global Inc.',
        appId: 'org.emetrotel.infinityone-electron',
        mac: {
          darkModeSupport: true,
          hardenedRuntime: true,
          category: 'public.app-category.productivity',
          entitlements: 'entitlements.mac.plist',
          entitlementsInherit: 'entitlements.mac.plist',
          extendInfo: {
            NSCameraUsageDescription: 'InfinityOne requires access to your camera in order to make video-calls.',
            NSMicrophoneUsageDescription: 'InfinityOne requires access to your microphone in order to make calls (audio/video).',
          },
        },
        dmg: {
          sign: false,
          background: 'build/appdmg.png',
          icon: 'build/icons/icon.icns',
          iconSize: 128,
          contents: [
            {
              x: 380,
              y: 240,
              type: 'link',
              path: '/Applications'
            },
            {
              x: 122,
              y: 240,
              type: 'file'
            }
          ]
        },
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