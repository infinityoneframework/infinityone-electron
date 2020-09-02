'use strict'

const { ipcRenderer } = require('electron')
const Helpers = require('./helpers')

const NativeNotification = window.Notification
class BaseNotification extends NativeNotification {
	constructor(title, opts) {
		super(title + ', ' + opts.subtitle, opts)

		this.addEventListener('click', () => {
			// focus to the server who sent the
			// notification if not focused already
			Helpers.focusCurrentServer()
			ipcRenderer.send('focus-app')
		})
	}

	static requestPermission() {
		return // eslint-disable-line no-useless-return
	}

	// Override default Notification permission
	static get _permission() {
		// I could not figure out how to get access to the config from here. Instead,
		// the ServerWebView view watches showNotification (and silent) and uses
		// webview.execJavaScript to set window.OneChat.notifier values.
		// const showNotification = configUtil.getConfigItem('showNotification', false)
		const showNotification = true
		return showNotification ? 'granted' : 'denied'
	}
}

// export default BaseNotification
module.exports = BaseNotification