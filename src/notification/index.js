'use strict'

const { remote} = require('electron')

// import ConfigUtil from '@/utils/config-util'
const DefaultNotification = require('./default-notification')
// import { appId, setNotificationCallback2 } from './helpers'
 const Helpers = require('./helpers')

// const { appId, setNotificationCallback2, setNotificationCallback } = require('./helpers')

// From https://github.com/felixrieseberg/electron-windows-notifications#appusermodelid
// On windows 8 we have to explicitly set the appUserModelId otherwise notification won't work.

// const debug = false

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
})
