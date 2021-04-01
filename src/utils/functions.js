import config from './config'

export function getExternalApiURL(serverURL) {
  if (!serverURL) {
      // eslint-disable-next-line no-param-reassign
      serverURL = config.defaultServerURL
  }

  return `${normalizeServerURL(serverURL)}/external_api.js`
}

export function isElectronMac() {
  return process.platform === 'darwin'
}

export function normalizeServerURL(url) {
  // eslint-disable-next-line no-param-reassign
  url = url.trim()

  if (url && url.indexOf('://') === -1) {
      return `https://${url}`
  }

  return url
}

export function openExternalLink(link) {
  window.jitsiNodeAPI.openExternalLink(link)
}

export function createConferenceObjectFromURL(inputURL) {
  const lastIndexOfSlash = inputURL.lastIndexOf('/')
  let room
  let serverURL

  if (lastIndexOfSlash === -1) {
      // This must be only the room name.
      room = inputURL
  } else {
      // Take the substring after last slash to be the room name.
      room = inputURL.substring(lastIndexOfSlash + 1)

      // Take the substring before last slash to be the Server URL.
      serverURL = inputURL.substring(0, lastIndexOfSlash)

      // Normalize the server URL.
      serverURL = normalizeServerURL(serverURL)
  }

  // Don't navigate if no room was specified.
  if (!room) {
      return
  }

  return {
      room,
      serverURL
  }
}
