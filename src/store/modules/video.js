import { make } from 'vuex-pathify'

const state = {
  props: {},
  domain: '',
  url: '',
  displayName: '',
  username: '',
  roomName: '',
  noSsl: '',
  protocol: '',
  avatarUrl: '',
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