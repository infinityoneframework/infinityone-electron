require('dotenv').config()
const { notarize } = require('electron-notarize')
const debug = false

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const timer = setInterval(() => {
    process.stdout.write('.')
  }, 15000)

  const appName = context.packager.appInfo.productFilename
  const appPath = `${appOutDir}/${appName}.app`

  if (debug) {
    console.info('notarize', appPath, process.env.APPLEID, process.env.APPLEIDPASS)
  }

  return new Promise((resolve, reject) => {
    notarize({
      // appBundleId: 'com.emetrotel.infinityone-electron',
      appBundleId: 'org.emetrotel.infinityone-electron',
      appPath: appPath,
      appleId: process.env.APPLEID,
      appleIdPassword: process.env.APPLEIDPASS,
      ascProvider: 'V99HVT33JG',
    })
      .then(() => {
        clearTimeout(timer)
        console.log()
        resolve()
      })
      .catch(error => {
        clearTimeout(timer)
        console.log()
        reject(error)
      })
  })
}