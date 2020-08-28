import fs from 'fs'
import path from 'path'
import process from 'process'
import store from '@/store'
import PersistPlugin from '@/store/persist-plugin'
import Utils from '@/utils/index'
// import Logger from './logger-util'

// const logger = new Logger({
// 	file: 'config-util.log',
// 	timestamp: true
// });
const DEBUG = false
let instance = null
// let rendererInstance = null
// let mainInstance = null
let dialog = null
let app = null

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
}

export default new ConfigUtil()
