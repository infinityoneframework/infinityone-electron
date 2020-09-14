import fs from 'fs'
import path from 'path'
import process from 'process'
import store from '@/store'
import PersistPlugin from '@/store/persist-plugin'
import Utils from '@/utils/index'
import i18n from '@/i18n'
// import Logger from './logger-util'

// const logger = new Logger({
// 	file: 'config-util.log',
// 	timestamp: true
// });

const { BrowserWindow } = require('electron')

const DEBUG = false
let instance = null
// let rendererInstance = null
// let mainInstance = null
let dialog = null
let app = null
const $t = msg => i18n.tc(msg)

const	userDataPath = () => {
	return path.join(app.getPath('userData'), '/settings.json')
}

/* To make the util runnable in both main and renderer process */
if (process.type === 'renderer') {
	const remote = require('electron').remote
	dialog = remote.dialog
	app = remote.app
} else {
	const electron = require('electron')
	dialog = electron.dialog
	app = electron.app
}

const appName = app.getName()

// const getInstance = () => {
//   if (process.type === 'renderer') {
// 		return rendererInstance
// 	}
// 	return mainInstance
// }

class ConfigUtil {
	constructor() {
		if (instance) {
			return instance
		} else {
			instance = this
		}
		this.debug = DEBUG

		PersistPlugin.addPlugin('config', this.saveUserData)

		return instance
	}

	getConfig() {
		return store.get('settings/config')
	}

	getConfigItem(key, defaultValue = null) {
		if (this.debug) { console.log('getConfigItem', key) }

		const value = store.get(`settings/config@${key}`)
		if (value === undefined) {
			this.setConfigItem(key, defaultValue)
			return defaultValue
		} else {
			return value
		}
	}

	toggleConfigItem(key) {
		store.set(`settings/toggleConfig`, key)
	}

	// TODO: Fix the reactivity issue below. Can't set an unknown prop

	setConfigItem(key, value) {
		store.set(`settings/config@${key}`, value)
	}

	saveConfigItems(items = {}) {
		Object.keys(items).forEach(key => {
			this.setConfigItem(key, items[key])
		})
		this.saveUserData(store.get('settings/config'))
	}

	removeConfigItem(key) {
		store.set('settings/deleteConfig', key)
	}

	reloadDB() {
    const settingsJsonPath = userDataPath()
		try {
			const json = Utils.verifyUserData(settingsJsonPath, 'settings', dialog)
			if (typeof json == 'object') {
				if (this.debug) { console.info('got json back', json) }

				return store.set('settings/config', json)
			}
			console.warn('was not able to verify userData')

		} catch (err) {
			console.warn('store.dispatch error', err)
		}

		store.set('settings/config', Utils.defaultSettings)
	}

	saveUserData(config) {
		fs.writeFileSync(userDataPath(), JSON.stringify(config, null, '\t'), { encoding: 'utf-8' })
	}

  clearAppDataConfirmation() {
    return dialog.showMessageBox({
      type: 'question',
      buttons: [$t('Cancel'), $t('Yes, clear it')],
      defaultId: 1,
      message: $t('Are you sure?'),
      detail: $t('This will remove all configuration, settings, and logs. This cannot be undone.')
    })
  }

  resetAppSettings() {
    // We save App's settings/configurations in following files
    const settingFiles = ['window-state.json', 'domain.json', 'settings.json'];

    this.clearAppDataConfirmation()
      .then(({ response = 0 })  => {
        if (this.debug) { console.log('clearAppDataConfirmation response', response)}
        if (response === 1) {
          settingFiles.forEach(settingFileName => {
            const getSettingFilesPath = path.join(app.getPath('appData'), appName, settingFileName);
            fs.access(getSettingFilesPath, error => {
              if (error) {
                console.log(error);
              } else {
                fs.unlink(getSettingFilesPath, () => {
                  this.sendAction('clear-app-data');
                });
              }
            });
          });
        }
      })
      .catch(error => {
        alert(`error: ${error}`)
      })

  }
  sendAction(action, ...params) {
    const win = BrowserWindow.getAllWindows()[0];

    if (process.platform === 'darwin') {
      win.restore();
    }

    win.webContents.send(action, ...params);
  }
}

export default new ConfigUtil()
