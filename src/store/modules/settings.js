import { make } from 'vuex-pathify'
import domainUtil from '@/utils/domain-util'

const saveUserData = list => domainUtil.saveUserDataDomains(list)

const state = {
  config: {},
  servers: [],
  nextServerId: 0,
  serverIds: {},
  activeServerId: null,
  currentComponent: null,
  settingsDrawer: false,
}

const mutations = {
  ...make.mutations(state),
  SET_REMOVE_SERVER: (state, index) => {
    const servers = state.servers.filter((item, i) => i !== index)
    state.servers = servers
    const serverIds = {}
    servers.forEach((item, inx) => {
      serverIds[item.serverId] = inx
    })
    state.serverIds = serverIds
    saveUserData(state.servers)
  },

  SET_REMOVE_SERVERS: state => {
    state.servers = []
    state.nextServerId = 0
    state.serverIds = {}
    saveUserData(state.servers)
  },

  SET_UPDATE_SERVER: (state, { index, server }) => {
    state.servers = state.servers.map((item, inx) => {
      if (inx !== index) {
        return item
      }
      return { ...server, serverId: item.serverId }
    })
    saveUserData(state.servers)
  },

  SET_ADD_SERVER: (state, server) => {
    const serverId = state.nextServerId++
    const tmp = {}
    tmp[serverId] = state.servers.length
    state.serverIds = { ...state.serverIds, ...tmp }
    state.servers.push({ ...server, serverId })
    saveUserData(state.servers)
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
    saveUserData(list)
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
