import fs from 'fs'

let app = null
let setupCompleted = false
if (process.type === 'renderer') {
	app = require('electron').remote.app
} else {
	app = require('electron').app
}

const oneDir = app.getPath('userData')
const logDir = `${oneDir}/Logs/`
const initSetUp = () => {
	// if it is the first time the app is running
	// create InfinityOne dir in userData folder to
	// avoid errors
	if (!setupCompleted) {
		if (!fs.existsSync(oneDir)) {
			fs.mkdirSync(oneDir)
		}

		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir)
		}
		setupCompleted = true
	}
}

export default { initSetUp }
