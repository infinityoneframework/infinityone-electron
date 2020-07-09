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
    }
  },
  transpileDependencies: [
    "vuetify"
  ],
}