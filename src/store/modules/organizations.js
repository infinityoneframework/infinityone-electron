import {
  make,
} from 'vuex-pathify'

const state = {
  list: [
  ],
}

const mutations = make.mutations(state)

const actions = {}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
