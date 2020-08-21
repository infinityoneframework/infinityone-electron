import fs from 'fs'
import path from 'path'
import process from 'process'
import request from 'request'
import PersistPlugin from '@/store/persist-plugin'
import Utils from './index.js'
// import { deleteProp } from '../utils'
// import { deleteProp, range } from '../utils'
// import Logger from './logger-util'

// const { app, dialog } = require('electron').remote

const defaultRealmIcon = '/images/notification_logo.png';

const	userDataPath = (filename = '/domain.json') => {
	return path.join(app.getPath('userData'), filename)
}

const	updateMenu = (tabs, activeTabIndex) => {
	if (process.type === 'renderer') {
		const { ipcRenderer } = require('electron')
		// const activeTabIndex = store.get('settings/activeServerIndex')
		ipcRenderer.send('update-menu', { tabs, activeTabIndex })
	}
}

// const logger = new Logger({
// 	file: 'config-util.log',
// 	timestamp: true
// });

let store = null
let instance = null
let dialog = null
let app = null

/* To make the util runnable in both main and renderer process */
if (process.type === 'renderer') {
	const remote = require('electron').remote
	dialog = remote.dialog
	app = remote.app
} else {
	const electron = require('electron')
	dialog = electron.dialog
	app = electron.app
}

let defaultIconUrl = './assets/icon-server.png'

if (process.platform === 'win32') {
	defaultIconUrl = path.normalize(defaultIconUrl)
}

console.log('defaultIconUrl', defaultIconUrl)

// Fix https issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

class DomainUtil {
	constructor() {
		if (instance) {
			return instance
		} else {
			instance = this
		}

		PersistPlugin.addPlugin('servers', this.saveUserDataDomains)

		// this.reloadDB()

		return instance
	}

	setStore(theStore) {
		store = theStore
	}

	getDomains() {
		return store.get('settings/servers')
	}

	getDomain(index) {
		return store.get(`settings/servers@[${index}]`)
	}

	updateDomain(index, server) {
		store.set('settings/updateServer', { index, server })
	}

	updateMenu(servers, index) {
		updateMenu(servers, index)
	}

	addDomain(server) {
		return new Promise(resolve => {
			if (server.icon) {
				this.saveServerIcon(server.icon).then(localIconUrl => {
					server.icon = localIconUrl;
					store.set('settings/addServer', server)
					// this.reloadDB();
					resolve();
				});
			} else {
				server.icon = defaultIconUrl;
				store.set('settings/addServer', server)
				// this.reloadDB();
				resolve();
			}
		});
	}

	removeDomains() {
		store.set('settings/removeServers')
		// this.reloadDB();
	}

	removeDomain(index) {
		store.set('settings/removeServer', index)
		// this.reloadDB();
	}

	// Check if domain is already added
	duplicateDomain(domain) {
		domain = this.formatUrl(domain);
		return  !!this.getDomains().find(item => item.url === domain)
	}

	checkDomain(domain, silent = false) {
		if (!silent && this.duplicateDomain(domain)) {
			// Do not check duplicate in silent mode
			return Promise.reject('This server has been added.');
		}

		domain = this.formatUrl(domain);

		const checkDomain = domain + defaultRealmIcon;

		const serverConf = {
			icon: defaultIconUrl,
			url: domain,
			alias: domain
		};

		return new Promise((resolve, reject) => {
			request(checkDomain, (error, response) => {
				const certsError =
					[
						'Error: self signed certificate',
						'Error: unable to verify the first certificate',
						'Error: unable to get local issuer certificate'
					];

				// If the domain contains following strings we just bypass the server
				const whitelistDomains = [
					'zulipdev.org',
					'localhost',
					'chat.spallen.com'
				];

				// make sure that error is a error or string not undefined
				// so validation does not throw error.
				error = error || '';
				if (!error && response.statusCode < 400) {
					// Correct
					this.getServerSettings(domain).then(serverSettings => {
						resolve(serverSettings);
					}, () => {
						resolve(serverConf);
					});
				} else if (domain.indexOf(whitelistDomains) >= 0 || certsError.indexOf(error.toString()) >= 0) {
					if (silent) {
						this.getServerSettings(domain).then(serverSettings => {
							resolve(serverSettings);
						}, () => {
							resolve(serverConf);
						});
					} else {
						const certErrorMessage = `Do you trust certificate from ${domain}? \n ${error}`;
						const certErrorDetail = `The server you're connecting to is either someone impersonating the Infinity One server you entered, or the server you're trying to connect to is configured in an insecure way.
						\n Unless you have a good reason to believe otherwise, you should not proceed.
						\n You can click here if you'd like to proceed with the connection.`;

						dialog.showMessageBox({
							type: 'warning',
							buttons: ['Yes', 'No'],
							defaultId: 0,
							message: certErrorMessage,
							detail: certErrorDetail
						}, response => {
							if (response === 0) {
								this.getServerSettings(domain).then(serverSettings => {
									resolve(serverSettings);
								}, () => {
									resolve(serverConf);
								});
							} else {
								reject('Untrusted Certificate.');
							}
						});
					}
				} else {
					const invalidOneServerError = `${domain} does not appear to be a valid Infinity One server. Make sure that \
					\n(1) you can connect to that URL in a web browser and \n (2) if you need a proxy to connect to the Internet, that you've configured your proxy in the Network settings \n (3) its an Infinity One server`;
					reject(invalidOneServerError);
				}
			});
		});
	}

	getServerSettings(domain) {
		const items = ["realm_icon","Site_Url","Site_Name", "Server_Version"]
		const queryParams = JSON.stringify({ id: { "$in": items } })
		const query = `?fields={"type":1}&query=${queryParams}`

		const serverSettingsUrl = domain + '/api/v1/settings.public' + query
		return new Promise((resolve, reject) => {
			request(serverSettingsUrl, (error, response) => {
				if (!error && response.statusCode === 200) {
					try {
						const resp = JSON.parse(response.body)

						let data = {}

						if (resp.settings) {
							resp.settings.forEach(item => {
								data[item.id] = item.value
							})
						}

						console.debug('server settings', resp)
						// eslint-disable-next-line no-prototype-builtins
						if (data.hasOwnProperty('Site_Url')) {
							let realmIcon

							if (data.realm_icon) {
								realmIcon = data.realm_icon
							} else {
								realmIcon = defaultIconUrl
							}

							resolve({
								// Some InfinityOne Servers use absolute URL for server icon whereas others use relative URL
								// Following check handles both the cases
								icon: realmIcon.startsWith('/') ? data.Site_Url + realmIcon : realmIcon,
								iconUrl: realmIcon,
								url: data.Site_Url,
								alias: data.Site_Name,
								serverVersion: data.Server_Version
							})
						} else {
							console.debug('invaild response', response)
							this.attempt_legacy_settings(domain, resolve, reject)
						}
					} catch (err) {
						console.debug('err', err)
						this.attempt_legacy_settings(domain, resolve, reject)
					}
				} else {
					this.attempt_legacy_settings(domain, resolve, reject)
				}
			})
		})
	}

	attempt_legacy_settings(domain, resolve, reject) {
		this.getServerSettingsLegacy(domain)
			.then(resp => {
				resolve(resp)
			})
			.catch(error  => {
				reject(error)
			})
	}

	getServerSettingsLegacy(domain) {
		const serverSettingsUrl = domain + '/api/v1/server_settings'
		return new Promise((resolve, reject) => {
			request(serverSettingsUrl, (error, response) => {
				if (!error && response.statusCode === 200) {
					try {
						const data = JSON.parse(response.body)
						console.debug('server settings legacy', data)
						// eslint-disable-next-line no-prototype-builtins
						if (data.hasOwnProperty('realm_uri')) {
							let realmIcon

							if (data.realm_icon) {
								realmIcon = data.realm_icon
							} else {
								realmIcon = defaultIconUrl
							}

							resolve({
								// Some InfinityOne Servers use absolute URL for server icon whereas others use relative URL
								// Following check handles both the cases
								icon: realmIcon.startsWith('/') ? data.realm_uri + realmIcon : realmIcon,
								iconUrl: realmIcon,
								url: data.realm_uri,
								alias: data.realm_name
							})
						}
					} catch (err) {
						reject('InfinityOne server invalid response')
					}
				} else {
					reject('InfinityOne server invalid version.')
				}
			})
		})
	}

	saveServerIcon(url) {
		// The save will always succeed. If url is invalid, downgrade to default icon.
		return new Promise(resolve => {
			const filePath = this.generateFilePath(url);
			const file = fs.createWriteStream(filePath);
			try {
				request(url).on('response', response => {
					response.on('error', err => {
						console.log(err);
						resolve(defaultIconUrl);
					});
					response.pipe(file).on('finish', () => {
						resolve(filePath);
					});
				}).on('error', err => {
					console.log(err);
					resolve(defaultIconUrl);
				});
			} catch (err) {
				console.log(err);
				resolve(defaultIconUrl);
			}
		});
	}

	updateSavedServer(url, index) {
		// Does not promise successful update
		this.checkDomain(url, true).then(newServerConf => {
			this.saveServerIcon(newServerConf.icon).then(localIconUrl => {
				newServerConf.icon = localIconUrl;
				this.updateDomain(index, newServerConf);
				this.reloadDB();
			});
		});
	}

	reloadDB() {
    const domainJsonPath = userDataPath()
		try {
			const json = Utils.verifyUserData(domainJsonPath, 'domain', dialog)
			if (typeof json == 'object') {
				console.info('got json back', json)
				return store.dispatch('settings/putServers', json['domains'] || [])
			}
			console.warn('was not able to verify userData')
		} catch (err) {
			console.warn('store.dispatch error', err)
		}

		store.set('settings/servers', [])
	}

	generateFilePath(url) {
		const dir = userDataPath('/server-icons')
		const extension = path.extname(url).split('?')[0];

		let hash = 5381;
		let len = url.length;

		while (len) {
			hash = (hash * 33) ^ url.charCodeAt(--len);
		}

		// Create 'server-icons' directory if not existed
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		return `${dir}/${hash >>> 0}${extension}`;
	}

	formatUrl(domain) {
		if (domain.match(/http?s:\/\//)) {
			return domain
		}
		return 'https://' + domain
	}

	saveUserDataDomains(servers) {
		const range = (start, end) => { return (new Array(end - start + 1)).fill(null).map((_, i) => i + start) }
		let domains = []
		const len = servers.length

		updateMenu(servers)

		if (len > 0) {
			const rg = range(0, len - 1)
			rg.forEach(i => { domains.push(servers[i]) })
			domains = domains.map(item => {
				const newItem = { ...item }
				delete newItem['serverId']
				return newItem
			})
		}
		fs.writeFileSync(userDataPath(), JSON.stringify({ domains }, null, '\t'), { encoding: 'utf-8' })
	}
}

export default new DomainUtil()