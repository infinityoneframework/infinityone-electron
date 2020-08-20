import { ipcRenderer } from 'electron'
import router from './router'
import ConfigUtil from '@/utils/config-util'
import DomainUtil from '@/utils/domain-util'
import store from '@/store'

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
    this.completeInit()
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

  toggleSidebar() {
    ConfigUtil.toggleConfigItem('showSidebar')
  }

  initTabs() {
		const servers = DomainUtil.getDomains();
		if (servers.length > 0) {
			for (let i = 0; i < servers.length; i++) {
        const server = servers[i]
				this.initServer(server, server.serverId);
				DomainUtil.updateSavedServer(server.url, i);
				this.activateTab(server.serverId);
			}
			// Open last active tab
			this.activateTab(ConfigUtil.getConfigItem('lastActiveTab'));
			// Remove focus from the settings icon at sidebar bottom
			// this.$settingsButton.classList.remove('active');
		} else {
			this.openSettings('servers/new');
		}
	}

  initServer(server, serverId) {
    console.log('initServer', serverId, server)
  }

	checkServers() {
		return this.initServers(DomainUtil.getDomains());
	}

	initServers(servers) {
		return new Promise(resolve => {
			if (servers.length === 0) {
				resolve(servers);
			} else {
				let cnt = servers.length;

				for (let i = 0; i < servers.length; i++) {
					const server = servers[i];

					DomainUtil.checkDomain(server.url, true).then(
						serverConfig => {
							if (server.alias !== serverConfig.alias || server.iconUrl !== serverConfig.iconUrl) {
								DomainUtil.updateDomain(i, serverConfig);
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
			shortcut: 'showShortcut',
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
  }

  openSettings(nav = 'settings') {
    router.push({ path: `/${nav}` })
  }

  openAbout() {
    router.push({ path: '/about' })
  }

  activateTab(serverId) {
    router.push( { path: `/server/${serverId}` })
  }
}

window.onload = () => {
  const serverManager = new ServerManager()

  serverManager.init()
}
