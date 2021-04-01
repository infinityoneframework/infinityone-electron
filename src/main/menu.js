'use strict'
import ConfigUtil from '@/utils/config-util'
import process from 'process'
import i18n from '@/i18n'

const { app, shell, BrowserWindow, Menu } = require('electron')
const appName = app.getName()
const debug = false

const $t = msg => i18n.tc(msg)

class AppMenu {
  getHistorySubmenu() {
    return [{
      label: $t('Back'),
      accelerator: process.platform === 'darwin' ? 'Command+Left' : 'Alt+Left',
      click(item, focusedWindow) {
        if (focusedWindow) {
          AppMenu.sendAction('back')
        }
      }
    }, {
      label: $t('Forward'),
      accelerator: process.platform === 'darwin' ? 'Command+Right' : 'Alt+Right',
      click(item, focusedWindow) {
        if (focusedWindow) {
          AppMenu.sendAction('forward')
        }
      }
    }]
  }

  getViewSubmenu() {
    return [{
      label: $t('Reload'),
      accelerator: 'CommandOrControl+R',
      click(item, focusedWindow) {
        if (focusedWindow) {
          AppMenu.sendAction('reload-current-viewer')
        }
      }
    }, {
      label: $t('Hard Reload'),
      accelerator: 'CommandOrControl+Shift+R',
      click(item, focusedWindow) {
        if (focusedWindow) {
          AppMenu.sendAction('hard-reload')
        }
      }
    }, {
      type: 'separator'
    }, {
      label: $t('Toggle Full Screen'),
      role: 'togglefullscreen'
    }, {
      label: $t('Zoom In'),
      accelerator: process.platform === 'darwin' ? 'Command+Plus' : 'Control+=',
      click(item, focusedWindow) {
        if (focusedWindow) {
          AppMenu.sendAction('zoomIn')
        }
      }
    }, {
      label: $t('Zoom Out'),
      accelerator: 'CommandOrControl+-',
      click(item, focusedWindow) {
        if (focusedWindow) {
          AppMenu.sendAction('zoomOut')
        }
      }
    }, {
      label: $t('Actual Size'),
      accelerator: 'CommandOrControl+0',
      click(item, focusedWindow) {
        if (focusedWindow) {
          AppMenu.sendAction('zoomActualSize')
        }
      }
    }, {
      type: 'separator'
    }, {
      label: $t('Toggle Tray Icon'),
      click(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.webContents.send('toggletray')
        }
      }
    }, {
      label: $t('Toggle Sidebar'),
      accelerator: 'CommandOrControl+S',
      click(item, focusedWindow) {
        if (debug) { console.log('toggle sidebar') }

        if (focusedWindow) {
          const newValue = !ConfigUtil.getConfigItem('showSidebar')
          focusedWindow.webContents.send('toggle-sidebar', newValue)
          ConfigUtil.setConfigItem('showSidebar', newValue)
        }
      }
    }, {
      label: $t('Toggle DevTools for InfinityOne App'),
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.webContents.toggleDevTools()
        }
      }
    }, {
      label: $t('Toggle DevTools for Active Tab'),
      accelerator: process.platform === 'darwin' ? 'Alt+Command+U' : 'Ctrl+Shift+U',
      click(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.webContents.send('open-dev-tools')
          AppMenu.sendAction('tab-devtools')
        }
      }
    }]
  }

  getHelpSubmenu() {
    return [
      {
        label: `${appName} ${$t('Desktop')} - v${app.getVersion()}`,
        enabled: false
      }, {
        label: $t('Show App Data'),
        click() {
          shell.openPath(app.getPath('userData'))
        }
      }
    ]
  }

  getWindowSubmenu(tabs, activeTabIndex) {
    const initialSubmenu = [{
      label: $t('Minimize'),
      role: 'minimize'
    }, {
      label: $t('Close Window'),
      role: 'close'
    }]

    if (tabs.length > 0) {
      initialSubmenu.push({
        type: 'separator'
      })
      for (let i = 0; i < tabs.length; i++) {
        initialSubmenu.push({
          label: tabs[i].alias,
          accelerator: `CommandOrControl+${i + 1}`,
          checked: i === activeTabIndex,
          click(item, focusedWindow) {
            if (focusedWindow) {
              AppMenu.sendAction('switch-server-tab', tabs[i].serverId)
            }
          },
          type: 'checkbox'
        })
      }
    }

    return initialSubmenu
  }

  getDarwinTpl(props) {
    const { tabs, activeTabIndex } = props

    return [{
      label: `${app.getName()}`,
      submenu: [{
        label: $t('About Infinity One'),
        click(item, focusedWindow) {
          if (focusedWindow) {
            AppMenu.sendAction('open-about')
          }
        }
      }, {
        type: 'separator'
      }, {
        label: $t('Desktop App Settings'),
        accelerator: 'Cmd+,',
        click(item, focusedWindow) {
          if (focusedWindow) {
            AppMenu.sendAction('open-settings')
          }
        }
      }, {
        label: $t('Keyboard Shortcuts'),
        accelerator: 'Cmd+Shift+K',
        click(item, focusedWindow) {
          if (focusedWindow) {
            AppMenu.sendAction('open-shortcuts')
          }
        }
      }, {
        type: 'separator'
      }, {
        label: $t('Reset App Settings'),
        accelerator: 'Command+Shift+D',
        click() {
          ConfigUtil.resetAppSettings()
        }
      }, {
        label: $t('Log Out'),
        accelerator: 'Cmd+L',
        click(item, focusedWindow) {
          if (focusedWindow) {
            AppMenu.sendAction('log-out')
          }
        }
      }, {
        type: 'separator'
      }, {
        label: $t('Services'),
        role: 'services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: $t('Hide'),
        role: 'hide'
      }, {
        label: $t('Hide Others'),
        role: 'hideothers'
      }, {
        label: $t('Unhide'),
        role: 'unhide'
      }, {
        type: 'separator'
      }, {
        label: $t('Quit') ,
        role: 'quit'
      }]
    }, {
      label: $t('Edit'),
      submenu: [{
        label: $t('Undo'),
        role: 'undo'
      }, {
        label: $t('Redo'),
        role: 'redo'
      }, {
        type: 'separator'
      }, {
        label: $t('Cut'),
        role: 'cut'
      }, {
        label: $t('Copy'),
        role: 'copy'
      }, {
        label: $t('Paste'),
        role: 'paste'
      }, {
        label: $t('Paste and Match Style'),
        role: 'pasteandmatchstyle'
      }, {
        label: $t('Delete'),
        role: 'delete'
      }, {
        label: $t('Select All'),
        role: 'selectall'
      }]
    }, {
      label: $t('View'),
      submenu: this.getViewSubmenu()
    }, {
      label: $t('History'),
      submenu: this.getHistorySubmenu()
    }, {
      label: $t('Window'),
      submenu: this.getWindowSubmenu(tabs, activeTabIndex)
    }, {
      role: 'help',
      submenu: this.getHelpSubmenu()
    }]
  }

  getOtherTpl(props) {
    const { tabs, activeTabIndex } = props

    return [{
      label: $t('File'),
      submenu: [{
        label: $t('About Infinity One'),
        click(item, focusedWindow) {
          if (focusedWindow) {
            AppMenu.sendAction('open-about')
          }
        }
      }, {
        type: 'separator'
      }, {
        label: $t('Desktop App Settings'),
        accelerator: 'Ctrl+,',
        click(item, focusedWindow) {
          if (focusedWindow) {
            AppMenu.sendAction('open-settings')
          }
        }
      }, {
        type: 'separator'
      }, {
        label: $t('Keyboard Shortcuts'),
        accelerator: 'Ctrl+Shift+K',
        click(item, focusedWindow) {
          if (focusedWindow) {
            AppMenu.sendAction('shortcut')
          }
        }
      }, {
        type: 'separator'
      }, {
        label: $t('Reset App Settings'),
        accelerator: 'Ctrl+Shift+D',
        click() {
          ConfigUtil.resetAppSettings()
        }
      }, {
        label: $t('Log Out'),
        accelerator: 'Ctrl+L',
        click(item, focusedWindow) {
          if (focusedWindow) {
            AppMenu.sendAction('log-out')
          }
        }
      }, {
        type: 'separator'
      }, {
        label: $t('Quit'),
        role: 'quit',
        accelerator: 'Ctrl+Q'
      }]
    }, {
      label: $t('Edit'),
      submenu: [{
        label: $t('Undo'),
        role: 'undo'
      }, {
        label: $t('Redo'),
        role: 'redo'
      }, {
        type: 'separator'
      }, {
        label: $t('Cut'),
        role: 'cut'
      }, {
        label: $t('Copy'),
        role: 'copy'
      }, {
        label: $t('Paste'),
        role: 'paste'
      }, {
        label: $t('Paste and Match Style'),
        role: 'pasteandmatchstyle'
      }, {
        label: $t('Delete'),
        role: 'delete'
      }, {
        type: 'separator'
      }, {
        label: $t('Select All'),
        role: 'selectall'
      }]
    }, {
      label: $t('View'),
      submenu: this.getViewSubmenu()
    }, {
      label: $t('History'),
      submenu: this.getHistorySubmenu()
    }, {
      label: $t('Window'),
      submenu: this.getWindowSubmenu(tabs, activeTabIndex)
    }, {
      role: 'help',
      submenu: this.getHelpSubmenu()
    }]
  }

  static sendAction(action, ...params) {
    const win = BrowserWindow.getAllWindows()[0]

    if (process.platform === 'darwin') {
      win.restore()
    }

    win.webContents.send(action, ...params)
  }

  setMenu(props) {
    const tpl = process.platform === 'darwin' ?
      this.getDarwinTpl(props) : this.getOtherTpl(props)

    const menu = Menu.buildFromTemplate(tpl)
    Menu.setApplicationMenu(menu)
  }
}

export default new AppMenu()
