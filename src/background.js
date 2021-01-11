"use strict"
/* global __static */

import { app, protocol, BrowserWindow, ipcMain, Menu, MenuItem } from "electron"
import { createProtocol } from "vue-cli-plugin-electron-builder/lib"
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer"
import windowStateKeeper from 'electron-window-state'
import appMenu from '@/main/menu'
import ConfigUtil from '@/utils/config-util'
import path from 'path'
import store from '@/store'
import BadgeSettings from '@/components/badge-settings'
import { setAutoLaunch } from '@/main/startup'
import { appUpdater } from '@/main/autoupdater'
import Logger from '@/utils/logger-util'
import config from '@/config'

const {
    setupPowerMonitorMain,
    setupScreenSharingMain
} = require('jitsi-meet-electron-utils')

ConfigUtil.reloadDB()

const debug = false
const isDevelopment = process.env.NODE_ENV !== "production"
const isDev = require('electron-is-dev')

// We need this because of https://github.com/electron/electron/issues/18214
app.commandLine.appendSwitch('disable-site-isolation-trials')

// https://bugs.chromium.org/p/chromium/issues/detail?id=1086373
app.commandLine.appendSwitch('disable-webrtc-hw-encoding')
app.commandLine.appendSwitch('disable-webrtc-hw-decoding')

app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('user-data-dir')

// Needed until robot.js is fixed: https://github.com/octalmage/robotjs/issues/580
app.allowRendererProcessReuse = false

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.mainPage = null
let mainWindow
let badgeCount

let isQuitting = false

const logger = new Logger({ file: 'crash-log.log' })
const console = new Logger({ file: 'console.log' })

const version = app.getVersion()
const versionMsg = isDev ? version + ' (dev)' : version
console.log('Starting InfinityOne v' + versionMsg)

const registerLocalResourceProtocol = () => {
  protocol.registerFileProtocol('local-resource', (request, callback) => {
    const url = request.url.replace(/^local-resource:\/\//, '')
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url) // Needed in case URL contains spaces

    try {
      return callback(decodedUrl)
    }
    catch (error) {
      console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
    }
  })
}

const gotTheLock = app.requestSingleInstanceLock()

const showOrMinimizeWindow = win => {
  if (isDev) { return }

  const startMinimized = ConfigUtil.getConfigItem('startMinimized')
  if (startMinimized) {
    if (debug) { console.log('[background] start minimized') }
    win.minimize()
  } else {
    if (debug) { console.log('[background] start showing') }
    win.show()
  }
}

const handleSpellCheck = params => {
  const menu = new Menu()

  const replaceMisspelling = suggestion => {
    mainWindow.webContents.replaceMisspelling(suggestion)
    mainWindow.webContents.send('replace-misspelling', suggestion)
  }

  for (const suggestion of params.dictionarySuggestions) {
    menu.append(new MenuItem({
      label: suggestion,
      click: () => replaceMisspelling(suggestion),
    }))
  }

  // Allow users to add the misspelled word to the dictionary
  if (params.misspelledWord) {
    menu.append(
      new MenuItem({
        label: 'Add to dictionary',
        click: () => mainWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
      })
    )
  }

  menu.popup()
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
])

async function createWindow() {
  if (!gotTheLock) {
    app.quit()
    return
  }

  const mainWindowState = windowStateKeeper({
		defaultWidth: 1100,
		defaultHeight: 720
  })

  const title = 'InfinityOne Desktop' + (isDev ? ' (dev)' : '')

	// Let's keep the window position global so that we can access it in other process
  global.mainWindowState = mainWindowState

  // Create the browser window.
  const win = new BrowserWindow({
    title: title,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 300,
    minHeight: 400,
    icon: path.join(__static, 'icon.png'),
    plugins: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      'web-security': false,
      webSecurity: false,
      nodeIntegration: true,
      experimentalFeatures: true, // Insertable streams, for E2EE.
      webviewTag: true,
      enableRemoteModule: true,
      allowRunningInsecureContent: true,
      spellcheck: true,
    }
  })

  win.setTitle(title)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()

    appUpdater()
  } else {
    createProtocol("app")
    // Load the index.html when not in development
    win.loadURL("app://./index.html")

    appUpdater()
  }

  setupPowerMonitorMain(win)
  setupScreenSharingMain(win, config.appName)

  win.on("closed", () => {
    mainWindow = null
    global.mainPage = null
  })

  win.on('close', event => {
    if (!isQuitting) {
      event.preventDefault()

      if (process.platform === 'darwin') {
        app.hide()
      } else {
        win.hide()
      }
    }
  })

  win.webContents.on('context-menu', (event, params) => {
    handleSpellCheck(params)
  })

  win.on('enter-full-screen', () => {
    win.webContents.send('enter-fullscreen')
  })

  win.on('leave-full-screen', () => {
    win.webContents.send('leave-fullscreen')
  })

  win.once('ready-to-show', () => {
    if (debug) { console.log('ready-to-show') }
  })

  win.webContents.on('will-navigate', e => {
    if (e) {
      win.webContents.send('destroytray')
    }
  })

  mainWindowState.manage(win)

  win.webContents.on('new-window', (event, url, frameName) => {
    console.debug('[background] win new-window', event, url, frameName)
  })

  win.webContents.on('dom-ready', () => {
    if (debug) { console.log('[background] dom-ready') }
  })

  win.webContents.on('did-finish-load', () => {
    if (debug) { console.log('[background] did-finish-load') }
		// Initate auto-updates on MacOS and Windows
		// appUpdater()
	})

  win.webContents.on('open-dev-tools', () => {
    if (debug) { console.warn('[background] page on open-dev-tools') }
  })

  return win
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.show()
  }
})

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault()
  callback(true)
})

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    mainWindow = createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  registerLocalResourceProtocol()


  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    if (debug) { console.log('[background] installing vuejs_devtools') }

    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error("[background] Vue Devtools failed to install:", e.toString())
    }
  }

  appMenu.setMenu({
		tabs: []
  })

  mainWindow = await createWindow()

  if (debug) { console.log('[background] after mainWindow') }

  showOrMinimizeWindow(mainWindow)

  const page = mainWindow.webContents
  global.mainPage = page

  ipcMain.on('open-dev-tools', () => {
    if (debug) { console.log('[background] ipcMain.on open-dev-tools') }
  })

  ipcMain.on('reload-app', () => {
    if (debug) { console.log('[background] reload-app') }

    app.relaunch()
    app.quit()
  })

  ipcMain.on('focus-app', () => {
    if (debug) { console.log('[background] focus..') }
    mainWindow.show()
  })

  ipcMain.on('minimize-app', () => {
    mainWindow.minimize()
  })

  ipcMain.on('quit-app', () => {
    if (debug) { console.log('[background] quit-app') }
    app.quit()
  })

  ipcMain.on('reload-full-app', () => {
    if (debug) { console.log('[background] reload-full-app') }
    mainWindow.reload()
    page.send('destroytray')
  })

  ipcMain.on('clear-app-settings', () => {
    if (debug) { console.log('[background] clear-app-settings') }

    global.mainWindowState.unmanage(mainWindow)
    app.relaunch()
    app.exit()
  })

  ipcMain.on('toggle-app', () => {
    if (debug) { console.log('[background] toggle-app') }
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      if (debug) { console.log('[background] show') }
      mainWindow.show()
    }
  })

  ipcMain.on('toggle-badge-option', () => {
    BadgeSettings.updateBadge(badgeCount, mainWindow)
  })

  ipcMain.on('update-badge', (event, messageCount) => {
    badgeCount = messageCount
    BadgeSettings.updateBadge(badgeCount, mainWindow)
    if (debug) { console.debug('[background] badgeCount', badgeCount, messageCount) }
    page.send('tray', messageCount)
  })

  ipcMain.on('update-taskbar-icon', (event, data, text) => {
    BadgeSettings.updateTaskbarIcon(data, text, mainWindow)
  })

  ipcMain.on('forward-message', (event, listener, ...params) => {
    page.send(listener, ...params)
  })

  ipcMain.on('update-menu', (event, props) => {
    appMenu.setMenu(props)
  })

  ipcMain.on('vuex-mutation', (e, mutation) => {
    const payload = mutation.payload
    if (payload === undefined || payload === null) { return }

    if (payload.expr) {
      store.set(payload.expr, payload.value)
    } else {
      store.commit(mutation.type, payload)
    }
  })

  ipcMain.on('toggleAutoLauncher', (event, autoLaunchValue) => {
    if (debug) { console.log('toggle setAutoLaunch', autoLaunchValue, setAutoLaunch) }
    try {
      setAutoLaunch(autoLaunchValue)
    }
    catch(error) {
      console.log('error', error)
    }
  })

  // This has been left in for testing...
  ipcMain.on('showConfig', () => {
    console.log('showConfig called...')
    // console.log('betaUpdate', store.get('settings/config@betaUpdate'))
    // console.log('betaUpdate1', store.state.settings.config.betaUpdate)
    // console.log('getConfigItem', ConfigUtil.getConfigItem('betaUpdate'))
    // const config = store.get('settings/config')
    // console.log('store.state keys', Object.keys(store.state))
    // console.log('store.state values', Object.values(store.state))
    // console.log('store.state.settings.config', store.state.settings.config)
    // console.log('config keys', Object.keys(config))
    // console.log('config values', Object.values(config))
    // console.log('betaUpdate', config.betaUpdate)
  })

  // this can be used for debugging to run a system command. For example,
  // in the main apps debug console, run the following:
  //
  // `require('electron').ipcRenderer.send('execjs', 'ls -l')
  //
  // You should see the output of the command in the main process window.
  ipcMain.on('execjs', (event, script) => {
    console.log('execjs', script)
    const { exec } = require('child_process')
    exec(script, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        // return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        // return
      }
      if (stdout) {
        console.log(`stdout: '${stdout}'`)
      }
    })
  })

  ipcMain.on('spellCheck', (event, params) => {
    handleSpellCheck(params)
  })
})

app.on('before-quit', () => {
  isQuitting = true
})

process.on('uncaughtException', err => {
	logger.error(err)
	logger.error(err.stack)
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit()
      }
    })
  } else {
    process.on("SIGTERM", () => {
      app.quit()
    })
  }
}
