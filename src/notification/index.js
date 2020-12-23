'use strict'

const { remote} = require('electron')

const DefaultNotification = require('./default-notification')
 const Helpers = require('./helpers')

// From https://github.com/felixrieseberg/electron-windows-notifications#appusermodelid
// On windows 8 we have to explicitly set the appUserModelId otherwise notification won't work.

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
