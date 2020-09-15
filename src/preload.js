const { ipcRenderer, remote, shell } = require('electron')
const os = require('os')
const whitelistedIpcChannels = [ 'protocol-data-msg', 'renderer-ready' ]
const jitsiMeetElectronUtils = require('jitsi-meet-electron-utils');
// const { openExternalLink } = require('./utils/openExternalLink')
const url = require('url');
const protocolRegex = /^https?:/i;

function openExternalLink(link) {
    let u;

    try {
        u = url.parse(link);
    } catch (e) {
        return;
    }

    if (protocolRegex.test(u.protocol)) {
        shell.openExternal(link);
    }
}

console.warn('this is the preload file.......................................')
// alert(`preload file: ${window.location.href}`)

if (window.location.pathname !== '/desktop') {
  require('./notification')
  return
}

window.remote = remote

window.jitsiNodeAPI = {
    osUserInfo: os.userInfo,
    getLocale: remote.app.getLocale,
    openExternalLink,
    jitsiMeetElectronUtils,
    ipc: {
        on: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return
            }

            return ipcRenderer.on(channel, listener)
        },
        send: channel => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return
            }

            return ipcRenderer.send(channel)
        },
        removeListener: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return
            }

            return ipcRenderer.removeListener(channel, listener)
        }
    }
}
