"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import windowStateKeeper from 'electron-window-state'
import appMenu from '@/main/menu'
import ConfigUtil from '@/utils/config-util'

// const appMenu = require('@/main/menu');

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let badgeCount

let isQuitting = false

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  const mainWindowState = windowStateKeeper({
		defaultWidth: 1100,
		defaultHeight: 720
  })

	// Let's keep the window position global so that we can access it in other process
  global.mainWindowState = mainWindowState;

  // Create the browser window.
  const win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 300,
    minHeight: 400,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      nodeIntegration: true,
      webviewTag: true,
      enableRemoteModule: true,
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    // win = null;
    mainWindow = null
  });

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

  win.setTitle('InfinityOne')

  win.on('enter-full-screen', () => {
    win.webContents.send('enter-fullscreen')
  })

  win.on('leave-full-screen', () => {
    win.webContents.send('leave-fullscreen')
  })

  win.webContents.on('will-navigate', e => {
    if (e) {
      win.webContents.send('destroytray')
    }
  })

  mainWindowState.manage(win)

  return win
}

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault()
  callback(true)
})

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    mainWindow = createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }

  appMenu.setMenu({
		tabs: []
  });

  mainWindow = createWindow();

  const page = mainWindow.webContents

  page.on('dom-ready', () => {
    if (ConfigUtil.getConfigItem('startMinimized')) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
    }
  })

  ipcMain.on('reload-app', () => {
    console.log('reload-app')
    app.relaunch()
    app.quit()
  })

  ipcMain.on('focus-app', () => {
    mainWindow.show()
  })
  
  ipcMain.on('quit-app', () => {
    app.quit()
  })

  ipcMain.on('reload-full-app', () => {
    console.log('reload-full-app')
    mainWindow.reload()
    page.send('destroytray')
  })

  ipcMain.on('clear-app-settings', () => {
    global.mainWindowState.unmanage(mainWindow)
    app.relaunch()
    app.exit()
  })

  ipcMain.on('toggle-app', () => {
    console.log('toggle-app')
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })

  ipcMain.on('toggle-badge-option', () => {
    // BadgeSettings.updateBadge(badgeCount, win)
  })

  ipcMain.on('update-badge', (event, messageCount) => {
    badgeCount = messageCount
    // BadgeSettings.updateBadge(badgeCount, win)
    console.log('badgeCount', badgeCount)
    page.send('tray', messageCount)
  })

  // ipcMain.on('update-taskbar-icon', (event, data, text) => {
  //   BadgeSettings.updateTaskbarIcon(data, text, win)
  // })

  ipcMain.on('forward-message', (event, listener, ...params) => {
    page.send(listener, ...params)
  })

  ipcMain.on('update-menu', (event, props) => {
    appMenu.setMenu(props)
  })

  // ipcMain.on('toggleAudoLauncher', (event, AutoLaunchValue) => {
  //   setAutoLaunch(AutoLaunchValue)
  // })

});

app.on('before-quit', () => {
  isQuitting = true
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
