'use strict'
/* global __static */
import path from 'path'
import electron from 'electron'
import ConfigUtil from '@/utils/config-util.js'
import DomainUtil from '@/utils/domain-util.js'

const {ipcRenderer, remote} = electron
const {Tray, Menu, nativeImage, BrowserWindow} = remote

// const APP_ICON = './assets/tray/tray'
const APP_ICON = path.join(__static, 'tray', 'tray')

// console.warn('from try __dirname', __dirname)
// console.warn('APP_ICON', APP_ICON)

const iconPath = () => {
	if (process.platform === 'linux') {
		return APP_ICON + 'linux.png'
	}
	return APP_ICON + (process.platform === 'win32' ? 'win.ico' : 'osx.png')
}

let unread = 0

const trayIconSize = () => {
	switch (process.platform) {
		case 'darwin':
			return 20
		case 'win32':
			return 100
		case 'linux':
			return 100
		default: return 80
	}
}

//  Default config for Icon we might make it OS specific if needed like the size
const config = {
	pixelRatio: window.devicePixelRatio,
	unreadCount: 0,
	showUnreadCount: true,
	unreadColor: '#F44336',
	readColor: '#000000',
	unreadBackgroundColor: '#a0CF4A',
	readBackgroundColor: '#87B530',
	size: trayIconSize(),
	thick: process.platform === 'win32'
}

const renderCanvas = function (arg) {
	config.unreadCount = arg
	console.log('renderCanvas', arg, config.unreadCount)

	return new Promise(resolve => {
		const SIZE = config.size * config.pixelRatio
		const PADDING = SIZE * 0.05
		const CENTER = SIZE / 2
		const HAS_COUNT = config.showUnreadCount && config.unreadCount
		const color = config.unreadCount ? config.unreadColor : config.readColor
		const backgroundColor = config.unreadCount ? config.unreadBackgroundColor : config.readBackgroundColor

		const canvas = document.createElement('canvas')
		canvas.width = SIZE
		canvas.height = SIZE
		const ctx = canvas.getContext('2d')

		// Circle
		// If (!config.thick || config.thick && HAS_COUNT) {
		ctx.beginPath()
		ctx.arc(CENTER, CENTER, (SIZE / 2) - PADDING, 0, 2 * Math.PI, false)
		ctx.fillStyle = backgroundColor
		ctx.fill()
		ctx.lineWidth = SIZE / (config.thick ? 10 : 20)
		ctx.strokeStyle = backgroundColor
		ctx.stroke()
		// Count or Icon
		if (HAS_COUNT) {
			console.warn('HAS_COUNT...')
			ctx.fillStyle = color
			ctx.textAlign = 'center'
			if (config.unreadCount > 99) {
				ctx.font = `${config.thick ? 'bold ' : ''}${SIZE * 0.4}px Helvetica`
				ctx.fillText('99+', CENTER, CENTER + (SIZE * 0.15))
			} else if (config.unreadCount < 10) {
				ctx.font = `${config.thick ? 'bold ' : ''}${SIZE * 0.8}px Helvetica`
				ctx.fillText(config.unreadCount, CENTER, CENTER + (SIZE * 0.30))
			} else {
				ctx.font = `${config.thick ? 'bold ' : ''}${SIZE * 0.65}px Helvetica`
				ctx.fillText(config.unreadCount, CENTER, CENTER + (SIZE * 0.25))
			}

			resolve(canvas)
		}
	})
}
/**
 * Renders the tray icon as a native image
 * @param arg: Unread count
 * @return the native image
 */
const renderNativeImage = function (arg) {
	return Promise.resolve()
		.then(() => renderCanvas(arg))
		.then(canvas => {
			const pngData = nativeImage.createFromDataURL(canvas.toDataURL('image/png')).toPNG()
			return Promise.resolve(nativeImage.createFromBuffer(pngData, config.pixelRatio))
		})
}

function sendAction(action) {
	const win = BrowserWindow.getAllWindows()[0]

	if (process.platform === 'darwin') {
		win.restore()
	}

	win.webContents.send(action)
}

const createTray = function () {
	window.tray = new Tray(iconPath())
	const contextMenu = Menu.buildFromTemplate([{
		label: 'About',
		click() {
      // We need to focus the main window first
      console.log('About clicked')
			ipcRenderer.send('focus-app')
			sendAction('open-about')
		}
	},
	{
		type: 'separator'
	},
	{
		label: 'Focus',
		click() {
			ipcRenderer.send('focus-app')
		}
	},
	{
		type: 'separator'
	},
	{
		label: 'Settings',
		click() {
			ipcRenderer.send('focus-app')
			sendAction('open-settings')
		}
	},
	{
		type: 'separator'
	},
	{
		label: 'Quit',
		click() {
			ipcRenderer.send('quit-app')
		}
	}
	])
	window.tray.setContextMenu(contextMenu)
	window.tray.on('click', () => {
		// Click event only works on Windows
		if (process.platform === 'win32') {
			ipcRenderer.send('toggle-app')
		}
	})
}

ipcRenderer.on('destroytray', event => {
	if (!window.tray) {
		return
	}

	window.tray.destroy()
	if (window.tray.isDestroyed()) {
		window.tray = null
	} else {
		throw new Error('Tray icon not properly destroyed.')
	}

	return event
})

const getToolTip = function () {
	const { url } = DomainUtil.getDomain(ConfigUtil.getConfigItem('lastActiveTab'))
	return `Infinity One\nActive Server: ${url}\n`
}

ipcRenderer.on('tray', (event, arg) => {
	if (!window.tray) {
		return
	}
	// We don't want to create tray from unread messages on macOS since it already has dock badges.
	if (process.platform === 'linux' || process.platform === 'win32') {
		const prefix = getToolTip()
		if (arg === 0) {
			unread = arg
			window.tray.setImage(iconPath())
			window.tray.setToolTip(prefix + 'No unread messages')
		} else {
			unread = arg
			renderNativeImage(arg).then(image => {
				window.tray.setImage(image)
				window.tray.setToolTip(prefix + arg + ' unread messages')
			})
		}
	}
})

function toggleTray() {
	let state
	if (window.tray) {
		state = false
		window.tray.destroy()
		if (window.tray.isDestroyed()) {
			window.tray = null
		}
		ConfigUtil.setConfigItem('trayIcon', false)
	} else {
		state = true
		createTray()
		if (process.platform === 'linux' || process.platform === 'win32') {
			renderNativeImage(unread).then(image => {
				window.tray.setImage(image)
				window.tray.setToolTip(unread + ' unread messages')
			})
		}
		ConfigUtil.setConfigItem('trayIcon', true)
	}
	const selector = 'webview:not([class*=disabled])'
	const webview = document.querySelector(selector)
	const webContents = webview.getWebContents()
	webContents.send('toggletray', state)
}

ipcRenderer.on('toggletray', toggleTray)

if (ConfigUtil.getConfigItem('trayIcon', true)) {
	createTray()
}
