import Vue from "vue"
import Vuex from "vuex"
import pathify from 'vuex-pathify'
import * as modules from './modules'
import persist from './persist-plugin'
import broadcaster from './ipc-broadcaster'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [
    pathify.plugin,
    persist.plugin,
    broadcaster.plugin,
  ],
  modules,
})
