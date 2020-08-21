'use strict'
import config from '@/config'
const { app } = require('electron')
const AutoLaunch = require('auto-launch')
const isDev = require('electron-is-dev')
const ConfigUtil = require('@/utils/config-util.js')

const setAutoLaunch = AutoLaunchValue => {
	// Don't run this in development
	if (isDev) {
		return
	}

	// On Mac, work around a bug in auto-launch where it opens a Terminal window
	// See https://github.com/Teamwork/node-auto-launch/issues/28#issuecomment-222194437

	const appPath = process.platform === 'darwin' ? app.getPath('exe').replace(/\.app\/Content.*/, '.app') : undefined // Use the default

	const OneAutoLauncher = new AutoLaunch({
		name: config.appName,
		path: appPath,
		isHidden: false
	})
	const autoLaunchOption = ConfigUtil.getConfigItem('startAtLogin', AutoLaunchValue)

	if (autoLaunchOption) {
		OneAutoLauncher.enable()
	} else {
		OneAutoLauncher.disable()
	}
}

export default {
	setAutoLaunch
}
