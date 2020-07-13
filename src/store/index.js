import Vue from "vue"
import Vuex from "vuex"
import pathify from 'vuex-pathify'
// import VuexPersistence from 'vuex-persist'
import * as modules from './modules'
import persist from './persist-plugin'

console.log('persistPlugin', persist)

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [
    pathify.plugin,
    persist.plugin,
  ],
  modules,
});
