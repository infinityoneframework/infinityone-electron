'use strict'

import { remote } from 'electron'


// import ConfigUtil from '@/utils/config-util'
import DefaultNotification from './default-notification'
// import { appId, setNotificationCallback2 } from './helpers'
import Helpers from './helpers'
// const { appId, setNotificationCallback2, setNotificationCallback } = require('./helpers')

// From https://github.com/felixrieseberg/electron-windows-notifications#appusermodelid
// On windows 8 we have to explicitly set the appUserModelId otherwise notification won't work.

const debug = false

const { app } = remote
app.setAppUserModelId(Helpers.appId)

let Notification = DefaultNotification

// TODO: The node-mac-notifiction package is broken. It raises an exception
//       when imported. Disabling mac specific notifications for now
// if (process.platform === 'darwin') {
//   console.warn('darwin')
//   const DarwinNotification = require('./darwin-notifications')
//   console.warn('after requrie ')
// 	Notification = DarwinNotification
// }

window.addEventListener('load', () => {
	Helpers.setNotificationCallback2(Notification)

	// if (typeof window.one_chat !== 'undefined' && typeof window.one_chat.notifier !== 'undefined') {
  if (window.one_chat && window.one_chat.notifier) {
		window.one_chat.notifier.audioEnabled = () => {
      // return !(ConfigUtil.getConfigItem('silent') || false)
      return true
		}
	} else {
		if (debug) { console.warn('window.one_chat.notifier is not defined') }
	}
})
