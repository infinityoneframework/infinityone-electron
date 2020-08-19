const { ipcRenderer, remote } = require('electron')
const os = require('os')
const jitsiMeetElectronUtils = require('jitsi-meet-electron-utils')

const whitelistedIpcChannels = [ 'protocol-data-msg', 'renderer-ready' ]

// require('@/notification')

window.jitsiNodeAPI = {
    osUserInfo: os.userInfo,
    jitsiMeetElectronUtils,
    getLocale: remote.app.getLocale,
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
