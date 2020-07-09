import {
  make,
} from 'vuex-pathify'

const state = {
  config: {},
  servers: [],
  nextServerId: 0,
  serverIds: {},
  activeServerId: null,
  currentComponent: null,
}

const mutations = {
  ...make.mutations(state),
  REMOVE_SERVER: (state, index) => {
    const servers = state.servers.filter((item, i) => i !== index)
    state.servers = servers
    const serverIds = {}
    servers.forEach((item, inx) => {
      serverIds[item.serverId] = inx
    })
    state.serverIds = serverIds
  }
}

const actions = {
  removeServer: ({ commit }, index) => {
    commit('REMOVE_SERVER', index)
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
    commit('SET_SERVERS', list)
    commit('SET_NEXT_SERVER_ID', nextId)
    commit('SET_SERVER_IDS', serverIds)
  },
}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
