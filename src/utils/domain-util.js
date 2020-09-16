import fs from 'fs'
import path from 'path'
import process from 'process'
import PersistPlugin from '@/store/persist-plugin'
import Utils from './index.js'
import router from '@/router'
import config from '@/config'
import axios from 'axios'
// import { deleteProp } from '../utils'
// import { deleteProp, range } from '../utils'
// import Logger from './logger-util'

// const { app, dialog } = require('electron').remote

const DEBUG = false
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

const certsError = [
  'Error: self signed certificate',
  'Error: unable to verify the first certificate',
  'Error: unable to get local issuer certificate'
]

// If the domain contains following strings we just bypass the server
const whitelistDomains = [
  'localhost',
]

const get = (url, callback) => {
  if (DEBUG) { console.warn('request', url) }
  axios.get(url, {
    timeout: 2000,
    validStatus: status => status >= 200 && status < 400,
  })
    .then(response => {
      if (DEBUG) { console.debug('got response', response) }
      callback(null, response)
    })
    .catch(error => {
      if (DEBUG) { console.warn('got error', error) }
      callback(error, null)
    })
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

let defaultIconUrl = require('@/assets/icon-server.png')

if (process.platform === 'win32') {
  defaultIconUrl = path.normalize(defaultIconUrl)
}

if (DEBUG) { console.log('defaultIconUrl', defaultIconUrl) }

// Fix https issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

class DomainUtil {
  constructor() {
    if (instance) {
      return instance
    } else {
      instance = this
      window.DomainUtil = this
    }

    this.debug = DEBUG

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

  openDomain() {
    const serverId = store.get('settings/lastServerId') || store.get('settings/servers@[0].serverId')
    router.push({ path: `/server/${serverId}`})
  }

  serverRetryTicks(count) {
    if (count <= config.serverRetryThreshould1) {
      return config.serverRetryTime1
    }
    if (count <= config.serverRetryThreshould2) {
      return config.serverRetryTime2
    }
    if (count <= config.serverRetryThreshould3) {
      return config.serverRetryTime3
    }
    return config.serverRetryTime4
  }

  addDomain(server) {
    return new Promise(resolve => {
      if (server.icon) {
        this.saveServerIcon(server.icon)
          .then(localIconUrl => {
            server.icon = localIconUrl;
            store.set('settings/addServer', server)
            resolve();
          });
      } else {
        server.icon = defaultIconUrl;
        store.set('settings/addServer', server)
        resolve();
      }
    });
  }

  removeDomains() {
    store.set('settings/removeServers')
  }

  removeDomain(index) {
    store.set('settings/removeServer', index)
  }

  // Check if domain is already added
  duplicateDomain(domain) {
    domain = this.formatUrl(domain);
    return  !!this.getDomains().find(item => item.url === domain)
  }

  checkDisabled() {
    const errors = store.get('settings/networkErrors')
    const servers = store.get('settings/servers')

    if (this.debug) { console.debug('checkDisabled') }

    Object.keys(errors).forEach(serverId => {
      const server = servers.find(s => s.serverId === parseInt(serverId))
      if (!server) {
        console.warn("invalid serverId", serverId)
        return
      }
      this.fetchDomain(server.url)
        .then(() => {
          if (this.debug) { console.debug('ckeckDisabled fetchDomain ok', server.url) }

          const errors = { ...store.get('settings/networkErrors') }
          delete errors[server.serverId]
          store.set('settings/networkErrors', errors)

          this.checkDomain(server.url, true)
        })
        .catch(error  => {
          if (this.debug) { console.warn('ckeckDisabled fetchDomain error', server.url, error) }
        })
    })
  }

  pingDomain (url) {
    const domain = this.formatUrl(url)
    const checkDomain = domain + defaultRealmIcon;
    if (this.debug) {
      console.warn('fetchDomain url', url, domain, checkDomain)
    }

    return new Promise((resolve, reject) => {
      get(checkDomain, (error, response) => {
        const cert = error ? certsError.indexOf(error.toString()) >= 0 : -1
        const certsCheck = domain.indexOf(whitelistDomains) >= 0 || cert >= 0
        if (!error && response.status < 400 || certsCheck) {
          resolve(response)
        } else {
          reject(error)
        }
      })
    })
  }

  fetchDomain (url) {
    const domain = this.formatUrl(url)
    if (this.debug) {
      console.warn('pingDomain url', url, domain)
    }

    return new Promise((resolve, reject) => {
      this.pingDomain(url)
        .then(() => {
          this.getServerSettings(domain).then(serverSettings => {
            if (this.debug) { console.debug('ping settings', serverSettings) }

            resolve(serverSettings)
          }, error => {
            reject(error)
          })
        })
        .catch(error => reject(error))
    })
  }

  switchLocalMode(config, local) {
    return this.switchLocalSettings(config, local ? config.local : config.remote)
  }

  switchLocalSettings(config, settings) {
    config.url = settings.url
    config.icon = settings.icon
    config.iconUrl = settings.iconUrl
    return config
  }

  verifyServer(server) {
    if (this.debug) { console.warn('verifyServer', server.url) }

    if (!(server.local && server.local.url)) {
      if (this.debug) { console.warn('no local url for', server.url) }
      return this.checkDomain(server.url, true)
    }

    const local = server.url === server.local.url
    const otherUrl = local ? server.remote.url : server.local.url

    if (this.debug) { console.warn('local, otherUrl', local, otherUrl) }

    return new Promise((resolve, reject) => {
      this.fetchDomain(server.remote.url)
        .then(config => {
          if (this.debug) { console.warn('got config', server.remote.url, config) }
          resolve(this.switchLocalMode(config, false))
        })
        .catch(() => {
          const localUrl = server.local.url
          if (this.debug) { console.warn('checking otherUrl', localUrl) }
          this.fetchDomain(localUrl)
            .then(config => {
              const newConfig = this.switchLocalMode(config, !local)
              if (this.debug) {
                console.warn('switching mode to', local ? 'remote' : 'local', newConfig)
              }
              resolve(newConfig)
            })
            .catch(error => {
              if (this.debug) { console.warn('error', error) }
              reject(error)
            })
        })
      })
  }

  checkDomain(domain, silent = false) {
    if (this.debug) {
      console.debug('checkDomain', domain, silent)
    }
    if (!silent && this.duplicateDomain(domain)) {
      // Do not check duplicate in silent mode
      return Promise.reject('This server has been added.');
    }

    domain = this.formatUrl(domain);

    const checkDomain = domain + defaultRealmIcon;

    const serverConf = {
      icon: defaultIconUrl,
      url: domain,
      alias: domain,
      local: {},
    };

    return new Promise((resolve, reject) => {
      get(checkDomain, (error, response) => {

        // make sure that error is a error or string not undefined
        // so validation does not throw error.
        error = error || '';
        if (!error && response.status < 400) {
          // Correct

          if (this.debug) { console.debug('no error, status: ', response.status) }

          this.getServerSettings(domain)
            .then(serverSettings => {
              if (this.debug) { console.debug('getServerSettings response', serverSettings) }
              resolve(serverSettings)
            })
            .catch(error => {
              if (this.debug) { console.warn('getServerSettings error', error) }
              resolve(serverConf)
            })
        } else if (domain.indexOf(whitelistDomains) >= 0 || certsError.indexOf(error.toString()) >= 0) {
          if (silent) {
            this.getServerSettings(domain)
              .then(serverSettings => {
                resolve(serverSettings);
              }) 
              .catch(() => {
                resolve(serverConf);
              })
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

  getLocalRealmIcon(localUrl, realmIcon) {
    if (!localUrl) {
      return null
    }
    return realmIcon.replace(/^http?s:\/\/.*?\//, localUrl + '/')
  }

  getServerSettings(domain) {
    if (this.debug) {
      console.warn('getServerSettings', domain)
    }
    const items = [
      "realm_icon",
      "Site_Url",
      "Site_Name",
      "Server_Version",
      "Local_Site_Host",
      "Local_Site_Port",
    ]

    const queryParams = JSON.stringify({ id: { "$in": items } })
    const query = `?fields={"type":1}&query=${queryParams}`

    const serverSettingsUrl = domain + '/api/v1/settings.public' + query
    return new Promise((resolve, reject) => {
      get(serverSettingsUrl, (error, response) => {
        if (!error && response.status === 200) {
          try {
            const resp = response.data

            if (DEBUG) { console.debug('getServerSettings resp', resp) }

            let data = {}

            if (resp.settings) {
              resp.settings.forEach(item => {
                data[item.id] = item.value
              })
            }

            // eslint-disable-next-line no-prototype-builtins
            if (data.hasOwnProperty('Site_Url')) {
              let realmIcon
              let local = {}

              if (this.debug) { console.warn('server response', resp) }

              const scheme = data.Site_Url.startsWith('https') ? 'https' : 'http'

              const localUrl = data.Local_Site_Host ? `${scheme}://${data.Local_Site_Host}:${data.Local_Site_Port}` : null

              if (data.realm_icon) {
                realmIcon = data.realm_icon
              } else {
                realmIcon = defaultIconUrl
              }

              const icon = realmIcon.startsWith('/') ? data.Site_Url + realmIcon : realmIcon

              if (this.debug) { console.debug('icons', icon, localUrl) }

              if (localUrl) {
                const localRealmIcon = this.getLocalRealmIcon(localUrl, realmIcon)
                local = {
                  url: localUrl,
                  icon: realmIcon.startsWith('/') ? localUrl + realmIcon : localRealmIcon,
                  iconUrl: localRealmIcon,
                }
              }

              if (this.debug) { console.debug('about to resolve, local:', local) }

              resolve({
                // Some InfinityOne Servers use absolute URL for server icon whereas others use relative URL
                // Following check handles both the cases
                icon: icon,
                iconUrl: realmIcon,
                url: data.Site_Url,
                alias: data.Site_Name,
                serverVersion: data.Server_Version,
                local,
                remote: {
                  url: data.Site_Url,
                  icon: icon,
                  iconUrl: realmIcon,
                },
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
    if (this.debug) {
      console.warn('getServerSettingsLegacy', domain)
    }
    const serverSettingsUrl = domain + '/api/v1/server_settings'
    return new Promise((resolve, reject) => {
      get(serverSettingsUrl, (error, response) => {
        if (!error && response.status === 200) {
          try {
            const data = response.data
            if (this.debug) {
              console.warn('server settings legacy', data)
            }
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
                alias: data.realm_name,
                local: {},
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
    if (this.debug) {
      console.warn('saveServerIcon', url)
    }
    return new Promise(resolve => {
      const filePath = this.generateFilePath(url)

      const ref = setTimeout(() => {
        console.log('saveServerIcon timeout') 
        resolve(defaultIconUrl)
      }, 3000)

      try {
        axios.request({
          method: 'get',
          url: url,
          timeout: 2000,
          validStatus: status => status >= 200 && status < 400,
          responseType:'blob',
        })
          .then(response => {
            // The following handles writing the blob to the local filesystem.

            const fileReader = new FileReader()

            fileReader.onload = function() {
              fs.writeFile(filePath, Buffer.from(new Uint8Array(this.result)), error => {
                if (error) {
                  console.warn("error writing", filePath, error)
                  clearTimeout(ref)
                  resolve(defaultIconUrl)
                  return
                }
                if (this.debug) { console.debug('file should be writtend') }

                clearTimeout(ref)
                resolve(filePath)
                // resolve(defaultIconUrl)
              })
            }

            fileReader.readAsArrayBuffer(response.data)
          })
          .catch(err => {
            if (err) {
              console.warn(err)
              clearTimeout(ref)
              resolve(defaultIconUrl)
            }
          })
      } catch (err) {
        clearTimeout(ref)
        console.warn(err)
        resolve(defaultIconUrl)
      }
    })
  }

  updateSavedServer(server, index) {
    // Does not promise successful update
    if (this.debug) {
      console.warn('updateSavedServer', server.url, index, server)
    }
    if (typeof server !== 'object') {
      new Error('server must be an object')
    }

    this.verifyServer(server).then(newServerConf => {
      if (this.debug) { console.warn('verified server resp', newServerConf) }
      this.saveServerIcon(newServerConf.icon)
        .then(localIconUrl => {
          if (this.debug) { console.debug('localIconUrl', localIconUrl) }

          newServerConf.icon = localIconUrl;
          this.updateDomain(index, newServerConf);
          this.reloadDB()
        })
        .catch(error => {
          console.warn('error saveing ServerIcon', newServerConf.icon, error)
          this.updateDomain(index, newServerConf);
          this.reloadDB()
        })
    });
  }

  reloadDB() {
    const domainJsonPath = userDataPath()
    try {
      const json = Utils.verifyUserData(domainJsonPath, 'domain', dialog)
      if (typeof json == 'object') {
        if (this.debug) { console.info('got json back', json) }

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

    return path.join(dir, `${hash >>> 0}${extension}`)
  }

  formatUrl(domain) {
    if (domain.match(/http?s:\/\//)) {
      return domain
    }
    return 'https://' + domain
  }

  saveUserDataDomains(servers) {
    if (this.debug) {
      console.error('saveUserDataDomains', servers)
    }
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