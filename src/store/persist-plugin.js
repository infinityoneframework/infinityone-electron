import process from 'process'
const plugins = {
  config: null,
  servers: null,
}
const debug = false

const addPlugin = (name, handler) => {
  plugins[name] = handler
  if (debug) { console.debug('addPlugin', name, plugins) }
}

const plugin = store => {
  store.subscribe((mutation, state) => {
    if (process.type === 'renderer') {
      if (/^settings\/SET_.*CONFIG$/.test(mutation.type)) {
        if (debug) { console.debug('persistSettings config', mutation.payload, state.settings.config) }

        if (plugins.config) {
          plugins.config(state.settings.config)
        }
      }
      else if (/^settings\/SET_.*_SERVERS?$/.test(mutation.type)) {
        if (debug) { console.debug('persistSettings servers', mutation.type, mutation.payload, state.settings.servers) }

        if (plugins.servers) {
          plugins.servers(state.settings.servers)
        }
      }
      else {
        if (debug) { console.debug('persist other', mutation.type, mutation.payload) }
      }
    }
  })
}

export default {
  addPlugin,
  plugin,
}