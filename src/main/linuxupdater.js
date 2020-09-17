import ConfigUtil from '@/utils/config-util'
import i18n from '@/i18n'
import Logger from '@/utils/logger-util'

const $t = (msg, ...args) => i18n.t(msg, ...args)
const { app, dialog } = require('electron')
const { Notification } = require('electron')

const request = require('request')
const semver = require('semver')
const LinuxUpdateUtil = require('@/utils/linux-update-util')
const debug = false

const logger = new Logger({
	file: 'updates.log',
	timestamp: true
})

const updateAvailableMessage = version => {
  dialog.showMessageBox({
    type: 'info',
    buttons: [$t('Close')],
    defaultId: 0,
    message: $t('InfinityOne Desktop update available'),
    detail: $t("Please use the system's package manager to update {version}", { version: version })
  }).then(() => {}).catch(() => {})
}

const checkForUpdatesRpm = () => {
  const { exec } = require('child_process')
  exec('dnf check-update infinityone', (error, stdout) => {
    if (stdout) {
      try {
        const version = stdout.split('\n').find(item => item.startsWith('infinityone')).split(' ').filter(item => item !== '')[1]
        if (version) {
          logger.log(`RPM update available ${version}`)
          updateAvailableMessage(version)
        }
      }
      catch(error) {
        if (debug) { logger.warn('error', error)}
      }
    }
  })
}

export function linuxUpdateNotification() {
  let	url = 'https://api.github.com/repos/infinityoneframework/infinityone-electron-vue/releases'
  url = ConfigUtil.getConfigItem('betaUpdate') ? url : url + '/latest'

  try {
    checkForUpdatesRpm()
  }
  catch(error) {
    if (debug) { console.warn('error', error) }
  }

  const options = {
    url,
    headers: {'User-Agent': 'request'}
  }

  request(options, (error, response, body) => {
    if (error) {
      console.log('Error:', error)
      return
    }
    if (response.statusCode < 400) {
      const data = JSON.parse(body)
      const latestVersion = ConfigUtil.getConfigItem('betaUpdate') ? data[0].tag_name : data.tag_name

      if (semver.gt(latestVersion, app.getVersion())) {
        const notified = LinuxUpdateUtil.getUpdateItem(latestVersion)
        if (notified === null) {
          new Notification({title: 'Infinity One Update', body: 'A new version ' + latestVersion + ' is available. Please update using your package manager.'}).show()
          LinuxUpdateUtil.setUpdateItem(latestVersion, true)
        }
      }
    } else {
      console.log('Status:', response.statusCode)
    }
  })
}
