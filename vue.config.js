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
        copyright: '©2020 E-MetroTel Global Inc.',
        appId: 'com.emetrotel.infinityone-electron',
        afterSign: "scripts/notarize.js",
        asar: true,
        asarUnpack: ['**/*.node'],

        linux: {
          category: 'Chat;GNOME;GTK;Network;InstantMessaging',
          packageCategory: 'GNOME;GTK;Network;InstantMessaging',
          description: 'InfinityOne Desktop Client for Linux',
          target: [
            'zip',
            'rpm',
            'AppImage'
          ],
          maintainer: 'Stephen Pallen <steve.pallen@emetrotel.com>',
          executableName: 'infinityone-desktop',
          desktop: {
            StartupWMClass: 'infinityOne.Chat',
            MimeType: 'x-scheme-handler/infinityone',
          },
          artifactName: 'infinityone-${version}.${ext}',
        },
        rpm: {
          artifactName: 'infinityone-${version}.${arch}.${ext}',
        },
        mac: {
          darkModeSupport: true,
          hardenedRuntime: true,
          gatekeeperAssess: false,
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
        win: {
          verifyUpdateCodeSignature: false,
          target: [
            {
              target: 'nsis-web',
              arch: [
                'x64',
                'ia32',
              ],
            },
          ],
          icon: 'build/icons/icon.ico',
          publisherName: 'E-Metrotel',
        },
        nsis: {
          perMachine: true,
          oneClick: false,
          allowToChangeInstallationDirectory: true,
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