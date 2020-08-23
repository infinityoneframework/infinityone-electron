import { make } from 'vuex-pathify'
import Utils from '@/utils/index'
// import domainUtil from '@/utils/domain-util'

// const saveUserData = list => list
// const saveUserData = list => domainUtil.saveUserDataDomains(list)

const state = {
  config: Utils.defaultSettings,
  servers: [],
  nextServerId: 0,
  serverIds: {},
  activeServerId: null,
  lastServerId: null,
  currentComponent: null,
  settingsDrawer: false,
  videoActive: false,
  videoUrl: null,
  videoClose: false,
  aboutOpen: false,
  badgeCounts: {},
  networkErrors: {},
  networkErrorTab: false,
}

const mutations = {
  ...make.mutations(state),

  SET_DELETE_CONFIG: (state, key) => {
    const newConfig = { ...state.config }
    delete newConfig[key]
    state.config = newConfig
  },

  SET_TOGGLE_CONFIG: (state, key) => {
    state.config[key] = !state.config[key]
  },

  SET_REMOVE_SERVER: (state, index) => {
    const servers = state.servers.filter((item, i) => i !== index)
    state.servers = servers
    const serverIds = {}
    servers.forEach((item, inx) => {
      serverIds[item.serverId] = inx
    })
    state.serverIds = serverIds
  },

  SET_REMOVE_SERVERS: state => {
    state.servers = []
    state.nextServerId = 0
    state.serverIds = {}
  },

  SET_UPDATE_SERVER: (state, { index, server }) => {
    state.servers = state.servers.map((item, inx) => {
      if (inx !== index) {
        return item
      }
      return { ...server, serverId: item.serverId }
    })
  },

  SET_ADD_SERVER: (state, server) => {
    const serverId = state.nextServerId++
    const tmp = {}
    tmp[serverId] = state.servers.length
    state.serverIds = { ...state.serverIds, ...tmp }
    state.servers.push({ ...server, serverId })
  },

  SET_ENABLE_SERVER: (state, { server, enable }) => {
    state.servers = state.servers.map(item => {
      if (item.serverId !== server.serverId) {
        return item
      }
      server.disabled = !enable
      return { ...server  }
    })
  },

  SET_NETWORK_ERRORS: (state, value) => {
    state.networkErrors = value
    if (Object.keys(value).length === 0) {
      state.networkErrorTab = false
    }
  },
}

const actions = {
  removeServer: ({ commit }, index) => {
    commit('SET_REMOVE_SERVER', index)
  },

  putServers: ({ commit, state }, servers) => {
    let nextId = state.nextServerId
    let serverIds = { ...state.serverIds }

    const list = servers.map((item, inx) => {
      const current = state.servers.length === 0 ? null : state.servers.find(elem => elem.url === item.url)
      if (current) {
        item.serverId = current.serverId
        serverIds[item.serverId] = inx
        return item
      }
      item.serverId = nextId++
      serverIds[item.serverId] = inx
      return item
    })
    console.log('putServer', [...list], list)
    commit('SET_SERVERS', list)
    commit('SET_NEXT_SERVER_ID', nextId)
    commit('SET_SERVER_IDS', serverIds)
  },
}

const getters = {
  activeServerIndex: (state) => state.serverIds[state.activeServerId],
  activeServerWebviewSelector: (state) => `webview[data-server-id="${state.lastServerId}"]`,
  enabledServers: (state) => state.servers.filter(s => !s.disabled),
  disabledServers: (state) => state.servers.filter(s => s.disabled),
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
