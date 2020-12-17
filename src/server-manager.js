import { ipcRenderer, remote } from 'electron'
import router from './router'
import ConfigUtil from '@/utils/config-util'
import DomainUtil from '@/utils/domain-util'
import store from '@/store'

const { session } = remote
const DEBUG = false

let instance = null

class ServerManager {
  constructor() {
    if (instance) {
      return instance
    }
    this.debug = DEBUG

    instance = this
    return instance
  }

  init() {
    this.loadProxy().then(() => {
      this.checkServers().then(() => {
        this.completeInit()
      })
    })
  }

  completeInit() {
    this.initTabs()

    this.registerIpcs()

    ipcRenderer.on('toggle-sidebar', () => {
      if (this.debug) { console.log('toggle-sidebar') }

      this.toggleSidebar()
    });

    ipcRenderer.on('open-dev-tools', () => {
      if (this.debug) { console.debug('got open-dev-tools') }
      const currentComponent = store.get('settings/currentComponent')
      let $el

      if (currentComponent) {
        if (this.debug) { console.debug('currentComponent', currentComponent) }

        if (currentComponent.name === 'ServerWebView') {
          const serverId = store.get('settings/activeServerId')
          $el = document.querySelector(`webview[data-server-id="${serverId}"]`)
        } else if (currentComponent.name === 'VideoConference') {
          $el = document.getElementById('video-container')
        }
        if ($el) {
          if ($el.isDevToolsOpened()) {
            $el.closeDevTools()
          } else {
            $el.openDevTools()
          }
        }
      }
    })
  }

  loadProxy() {
    return new Promise(resolve => {
      const proxyEnabled = ConfigUtil.getConfigItem('useProxy', false);
      if (proxyEnabled) {
        session.fromPartition('persist:webviewsession').setProxy({
          pacScript: ConfigUtil.getConfigItem('proxyPAC', ''),
          proxyRules: ConfigUtil.getConfigItem('proxyRules', ''),
          proxyBypassRules: ConfigUtil.getConfigItem('proxyBypass', '')
        }).then(resolve)
      } else {
        session.fromPartition('persist:webviewsession').setProxy({
          pacScript: '',
          proxyRules: '',
          proxyBypassRules: ''
        }).then(resolve)
      }
    });
  }

  toggleSidebar() {
    ConfigUtil.toggleConfigItem('showSidebar')
  }

  initTabs() {
    const servers = DomainUtil.getDomains();
    if (servers.length > 0) {
      for (let i = 0; i < servers.length; i++) {
        const server = servers[i]
        this.initServer(server, i)
      }
      // Open last active tab
      if (store.get('settings/networkErrors') == {}) {
        this.activateTab(ConfigUtil.getConfigItem('lastActiveTab'))
      }
      // Remove focus from the settings icon at sidebar bottom
      // this.$settingsButton.classList.remove('active');
    } else {
      this.openSettings('servers/new');
    }
  }

  initServer(server, inx) {
    store.set('settings/enableServer', { server, enable: true })
    DomainUtil.updateSavedServer(server, inx)
    this.activateTab(server.serverId)
  }

  checkServers() {
    return this.initServers(DomainUtil.getDomains());
  }

  initServers(servers) {
    if (this.debug) { console.warn('initServers', servers) }

    return new Promise(resolve => {
      if (servers.length === 0) {
        resolve(servers);
      } else {
        let cnt = servers.length;

        for (let i = 0; i < servers.length; i++) {
          const server = servers[i];

          DomainUtil.verifyServer(server).then(
            serverConfig => {
              if (this.debug) {
                console.warn('same?', server.url, this.isServerChanged(server, serverConfig))
                console.warn('serverConfig', serverConfig)
              }

              // if (server.alias !== serverConfig.alias || server.iconUrl !== serverConfig.iconUrl) {
              if (this.isServerChanged(server, serverConfig)) {
                DomainUtil.updateDomain(i, serverConfig)
                if (this.debug) { console.warn('updated server', i, store.get(`settings/servers`)[i]) }
              }
              if (--cnt <= 0) {
                resolve();
              }
            },
            () => {
              if (--cnt <= 0) {
                resolve();
              }
            }
          );
        }
      }
    });
  }

  isServerChanged(server, serverConfig) {
    return server.alias !== serverConfig.alias || server.iconUrl !== serverConfig.iconUrl ||
      server.url !== serverConfig.url || server.local !== serverConfig.local ||
      server.remote !== serverConfig
  }

  registerIpcs() {
    // const webviewListeners = {
    //   'webview-reload': 'reload',
    //   back: 'back',
    //   focus: 'focus',
    //   forward: 'forward',
    //   zoomIn: 'zoomIn',
    //   zoomOut: 'zoomOut',
    //   zoomActualSize: 'zoomActualSize',
    //   'log-out': 'logOut',
    //   'tab-devtools': 'openDevTools'
    // };

    // for (const key in webviewListeners) {
    //   ipcRenderer.on(key, () => {
    //     try {
    //       const { webview: activeWebview} = this.tabs[this.activeTabIndex] || {}
    //       if (activeWebview) {
    //         activeWebview[webviewListeners[key]]()
    //       }
    //     }
    //     catch (error) {
    //       console.warn(error)
    //       console.log('tabs, activeTabIndex', this.tabs, this.activeTabIndex)
    //     }
    //   });
    // }

    ipcRenderer.on('open-settings', (event, settingNav) => {
      this.openSettings(settingNav);
    });

    ipcRenderer.on('open-about', () => {
      return this.openAbout()
    })

    ipcRenderer.on('open-shortcuts', () => {
      return this.openSettings('shortcuts')
    })

    // ipcRenderer.on('reload-viewer', this.reloadView.bind(this, this.tabs[this.activeTabIndex].props.index));

    // ipcRenderer.on('reload-current-viewer', this.reloadCurrentView.bind(this));

    ipcRenderer.on('hard-reload', () => {
      ipcRenderer.send('reload-full-app');
    });

    ipcRenderer.on('clear-app-data', () => {
      ipcRenderer.send('clear-app-settings');
    });

    ipcRenderer.on('switch-server-tab', (event, index) => {
      this.activateTab(index);
    })

    ipcRenderer.on('reload-viewer', (event, servers) => {
      this.reloadView(servers)
    })

    ipcRenderer.on('log-out', () => {
      const current = store.get('settings/currentComponent')
      if (current && current.methods && current.methods.logOut) {
        const id = store.get('settings/activeServerId')
        if (id) {
          current.methods.logOut(id)
        }
      }
    })

    ipcRenderer.on('render-taskbar-icon', (event, messageCount) => {
      console.log('render-taskbar-icon', messageCount)
      function createOverlayIcon(messageCount) {
				const canvas = document.createElement('canvas')
				canvas.height = 128
				canvas.width = 128
				canvas.style.letterSpacing = '-5px'
				const ctx = canvas.getContext('2d')
				ctx.fillStyle = '#f42020'
				ctx.beginPath()
				ctx.ellipse(64, 64, 64, 64, 0, 0, 2 * Math.PI)
				ctx.fill()
				ctx.textAlign = 'center'
				ctx.fillStyle = 'white'
				if (messageCount > 99) {
					ctx.font = '65px Helvetica'
					ctx.fillText('99+', 64, 85)
				} else if (messageCount < 10) {
					ctx.font = '90px Helvetica'
					ctx.fillText(String(Math.min(99, messageCount)), 64, 96)
				} else {
					ctx.font = '85px Helvetica'
					ctx.fillText(String(Math.min(99, messageCount)), 64, 90)
				}
				return canvas
      }
      ipcRenderer.send('update-taskbar-icon', createOverlayIcon(messageCount).toDataURL(), String(messageCount))
    })
  }

  openSettings(nav = 'settings') {
    if (this.debug) { console.warn('openSettings', nav) }

    router.push({ path: `/${nav}` })
  }

  openAbout() {
    router.push({ path: '/about' })
  }

  activateTab(serverId) {
    router.push({ path: `/server/${serverId}` })
  }

  reloadView(servers) {
    const serverList = store.get('settings/servers')
    servers.forEach(serverId => {
      const id = parseInt(serverId)
      const server = serverList.find(s => s.serverId === id)
      store.set('settings/enableServer', { server, enable: false })
    })
    setTimeout(() => {
      this.initTabs()
    }, 1000)
  }
}

window.onload = () => {
  const serverManager = new ServerManager()

  serverManager.init()
}
