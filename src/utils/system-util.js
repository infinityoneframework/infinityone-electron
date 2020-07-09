const { ipcRenderer } = require('electron')

let instance = null

class SystemUtil {
	constructor() {
		if (instance) {
			return instance
		} else {
			instance = this
		}

    return instance
  }

  reload () {
    console.log('reload...')
    ipcRenderer.send('reload-app')
  }
}

export default new SystemUtil()