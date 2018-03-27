'use strict';

const { ipcRenderer } = require('electron');
const ConfigUtil = require('../utils/config-util');
const Logger = require('../utils/logger-util');
const { focusCurrentServer } = require('./helpers');

const logger = new Logger({
	file: 'notifications.log',
	timestamp: true
});

const NativeNotification = window.Notification;
class BaseNotification extends NativeNotification {
	constructor(title, opts) {
		logger.info('constructor', title);
		console.log('notification opts', opts);
		// opts.silent = true;
		super(title, opts);

		this.addEventListener('click', () => {
			// focus to the server who sent the
			// notification if not focused already
			focusCurrentServer();
			ipcRenderer.send('focus-app');
		});
	}

	static requestPermission() {
		return; // eslint-disable-line no-useless-return
	}

	// Override default Notification permission
	static get permission() {
		return ConfigUtil.getConfigItem('showNotification') ? 'granted' : 'denied';
	}
}

module.exports = BaseNotification;
