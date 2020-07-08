import {
  make,
} from 'vuex-pathify'

const state = {
  config: {},
  servers: [],
}

const mutations = {
  ...make.mutations(state),
  REMOVE_SERVER: (state, index) => {
    state.servers = state.servers.filter((item, i) => i !== index)
  }
}

const actions = {
  removeServer: ({ commit }, index) => {
    commit('REMOVE_SERVER', index)
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
