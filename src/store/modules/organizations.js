import {
  make,
} from 'vuex-pathify'

const state = {
  list: [
    { url: "test.com", name: "Test" },
    { url: "other.com", name: "Other" },
    { url: "last.com", name: "Last" },
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
