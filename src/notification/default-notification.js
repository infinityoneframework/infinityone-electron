'use strict'

import { ipcRenderer } from 'electron'
import ConfigUtil from '@/utils/config-util'
// import { focusCurrentServer } from './helpers'
import Helpers from './helpers'

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
		const showNotification = ConfigUtil.getConfigItem('showNotification')
		// console.warn('showNotification', showNotification)
		return showNotification ? 'granted' : 'denied'
	}
}

export default BaseNotification