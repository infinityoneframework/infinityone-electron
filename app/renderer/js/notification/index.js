'use strict';

const {
	remote: { app }
} = require('electron');

const ConfigUtil = require('../utils/config-util');
const DefaultNotification = require('./default-notification');
const { appId, setNotificationCallback2 } = require('./helpers');
// const { appId, setNotificationCallback2, setNotificationCallback } = require('./helpers');

// From https://github.com/felixrieseberg/electron-windows-notifications#appusermodelid
// On windows 8 we have to explicitly set the appUserModelId otherwise notification won't work.
app.setAppUserModelId(appId);

let Notification = DefaultNotification;

if (process.platform === 'darwin') {
	const DarwinNotification = require('./darwin-notifications');
	Notification = DarwinNotification;
}

window.addEventListener('load', () => {
	setNotificationCallback2(Notification);

	if (typeof window.one_chat !== 'undefined' && typeof window.one_chat.notifier !== 'undefined') {
		window.one_chat.notifier.audioEnabled = () => {
			return !(ConfigUtil.getConfigItem('silent') || false);
		};
	} else {
		console.warn('window.one_chat.notifier is not defined');
	}
});
