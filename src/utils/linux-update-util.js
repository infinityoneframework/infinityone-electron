import Logger from '@/utils/logger-util'
import { JsonDB } from 'node-json-db'
import i18n from '@/i18n'

const $t = (msg, ...args) => i18n.t(msg, ...args)
const fs = require('fs')
const path = require('path')
const process = require('process')
const remote =
	process.type === 'renderer' ? require('electron').remote : require('electron')

const logger = new Logger({
	file: 'linux-update-util.log',
	timestamp: true
})

/* To make the util runnable in both main and renderer process */
const { dialog, app } = remote

let instance = null

class LinuxUpdateUtil {
	constructor() {
		if (instance) {
			return instance
		} else {
			instance = this
		}

		this.reloadDB()
		return instance
	}

	getUpdateItem(key, defaultValue = null) {
		this.reloadDB()
		const value = this.db.getData('/')[key]
		if (value === undefined) {
			this.setUpdateItem(key, defaultValue)
			return defaultValue
		} else {
			return value
		}
	}

	setUpdateItem(key, value) {
		this.db.push(`/${key}`, value, true)
		this.reloadDB()
	}

	removeUpdateItem(key) {
		this.db.delete(`/${key}`)
		this.reloadDB()
	}

	reloadDB() {
		const linuxUpdateJsonPath = path.join(app.getPath('userData'), '/updates.json')
		try {
			const file = fs.readFileSync(linuxUpdateJsonPath, 'utf8')
			JSON.parse(file)
		} catch (err) {
			if (fs.existsSync(linuxUpdateJsonPath)) {
				fs.unlinkSync(linuxUpdateJsonPath)
				dialog.showErrorBox(
					$t('Error saving update notifications.'),
					$t('We encountered an error while saving update notifications.')
				)
				logger.error('Error while JSON parsing updates.json: ')
				logger.error(err)
			}
		}
		this.db = new JsonDB(linuxUpdateJsonPath, true, true)
	}
}

export default new LinuxUpdateUtil()
