'use strict'

import { remote } from 'electron'


import ConfigUtil from '@/utils/config-util'
import DefaultNotification from './default-notification'
// import { appId, setNotificationCallback2 } from './helpers'
import Helpers from './helpers'
// const { appId, setNotificationCallback2, setNotificationCallback } = require('./helpers')

// From https://github.com/felixrieseberg/electron-windows-notifications#appusermodelid
// On windows 8 we have to explicitly set the appUserModelId otherwise notification won't work.

const { app } = remote
app.setAppUserModelId(Helpers.appId)

let Notification = DefaultNotification

if (process.platform === 'darwin') {
	const DarwinNotification = require('./darwin-notifications')
	Notification = DarwinNotification
}

window.addEventListener('load', () => {
	Helpers.setNotificationCallback2(Notification)

	if (typeof window.one_chat !== 'undefined' && typeof window.one_chat.notifier !== 'undefined') {
		window.one_chat.notifier.audioEnabled = () => {
			return !(ConfigUtil.getConfigItem('silent') || false)
		}
	} else {
		console.warn('window.one_chat.notifier is not defined')
	}
})
