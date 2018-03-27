'use strict';

const {
	remote: { app }
} = require('electron');

const DefaultNotification = require('./default-notification');
const { appId, setNotificationCallback } = require('./helpers');

// From https://github.com/felixrieseberg/electron-windows-notifications#appusermodelid
// On windows 8 we have to explicitly set the appUserModelId otherwise notification won't work.
app.setAppUserModelId(appId);

// window.Notification = DefaultNotification;
let Notification = DefaultNotification;

if (process.platform === 'darwin') {
	const DarwinNotification = require('./darwin-notifications');
	//   window.Notification = DarwinNotification;
	Notification = DarwinNotification;
}

window.addEventListener('load', () => {
	// Call this function only when user is logged in
	// eslint-disable-next-line no-undef, camelcase
	setNotificationCallback((title, opts) => {
		// const handlersOpts = opts.opts;
		// delete opts.opts;
		console.log('notification', title, opts);
		const localNotification = new Notification(title, opts);
		// setHandlers(Notification, handlersOpts);
		return localNotification;
	});

	// if (page_params.realm_uri) {
	// 	// loadBots();
	// }
});
