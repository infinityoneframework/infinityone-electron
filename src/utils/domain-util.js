import fs from 'fs'
import path from 'path'
import process from 'process'
import store from '../store'
// import Logger from './logger-util'

const { app, dialog } = require('electron').remote

// const logger = new Logger({
// 	file: 'config-util.log',
// 	timestamp: true
// });
let instance = null

let defaultIconUrl = './assets/icon-server.png'

if (process.platform === 'win32') {
	defaultIconUrl = path.normalize(defaultIconUrl)
}

console.log('defaultIconUrl', defaultIconUrl)

// Fix https issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

class DomainUtil {
	constructor() {
		if (instance) {
			return instance
		} else {
			instance = this
		}

		this.reloadDB()

		return instance
  }

	reloadDB() {
    const domainJsonPath = path.join(app.getPath('userData'), '/domain.json')
    const test = false
		try {
			const file = fs.readFileSync(domainJsonPath, 'utf8')
      const json = JSON.parse(file)
      store.dispatch('settings/putServers', json['domains'] || [])
		} catch (err) {
			if (test && fs.existsSync(domainJsonPath)) {
				fs.unlinkSync(domainJsonPath);
				dialog.showErrorBox(
					'Error saving new server',
					'There seems to be error while saving new server, ' +
					'you may have to re-add your previous servers back.'
				);
				// logger.error('Error while JSON parsing domain.json: ');
				// logger.error(err);
				console.error('Error while JSON parsing domain.json: ');
				console.error(err);
			}
		}
	}
}
  
export default new DomainUtil()