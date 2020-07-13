const plugins = {
  config: null,
  servers: null,
}

const addPlugin = (name, handler) => {
  plugins[name] = handler
  console.log('addPlugin', name, plugins)
}

const plugin = store => {
  store.subscribe((mutation, state) => {
    if (/^settings\/SET_.*CONFIG$/.test(mutation.type)) {
      console.log('persistSettings config', mutation.payload, state.settings.config)
      if (plugins.config) {
        plugins.config(state.settings.config)
      }
    }
    else if (/^settings\/SET_.*_SERVERS?$/.test(mutation.type)) {
      console.log('persistSettings servers', mutation.type, mutation.payload, state.settings.servers)
      if (plugins.servers) {
        plugins.servers(state.settings.servers)
      }
    }
    else {
      console.log('persist other', mutation.type, mutation.payload)
    }
  })
}

export default { 
  addPlugin,
  plugin,
}