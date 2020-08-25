import { ipcRenderer, remote } from 'electron'
import router from './router'
import ConfigUtil from '@/utils/config-util'
import DomainUtil from '@/utils/domain-util'
import store from '@/store'

const { session } = remote

let instance = null

class ServerManager {
  constructor() {
    if (instance) {
      return instance
    }

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
      console.log('toggle-sidebar')
      this.toggleSidebar()
    });

    ipcRenderer.on('open-dev-tools', () => {
      console.debug('got open-dev-tools')
      const currentComponent = store.get('settings/currentComponent')
      let $el
      if (currentComponent) {
        console.debug('currentComponent', currentComponent)
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
    console.warn('initServers', servers)
    return new Promise(resolve => {
      if (servers.length === 0) {
        resolve(servers);
      } else {
        let cnt = servers.length;

        for (let i = 0; i < servers.length; i++) {
          const server = servers[i];

          DomainUtil.verifyServer(server).then(
            serverConfig => {
              console.warn('same?', server.url, this.isServerChanged(server, serverConfig))
              console.warn('serverConfig', serverConfig)
              // if (server.alias !== serverConfig.alias || server.iconUrl !== serverConfig.iconUrl) {
              if (this.isServerChanged(server, serverConfig)) {
                DomainUtil.updateDomain(i, serverConfig)
                console.warn('updated server', i, store.get(`settings/servers`)[i])
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
    const webviewListeners = {
      'webview-reload': 'reload',
      back: 'back',
      focus: 'focus',
      forward: 'forward',
      zoomIn: 'zoomIn',
      zoomOut: 'zoomOut',
      zoomActualSize: 'zoomActualSize',
      'log-out': 'logOut',
      'tab-devtools': 'openDevTools'
    };

    for (const key in webviewListeners) {
      ipcRenderer.on(key, () => {
        const activeWebview = this.tabs[this.activeTabIndex].webview;
        if (activeWebview) {
          activeWebview[webviewListeners[key]]();
        }
      });
    }

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
  }

  openSettings(nav = 'settings') {
    console.warn('openSettings', nav)
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
