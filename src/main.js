import Vue from "vue";
import "./plugins/axios";
import 'path'
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./i18n";
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import config from '@/utils/config-util'
import domain from '@/utils/domain-util'

Vue.config.productionTip = false;
Vue.config.devtools = process.env.NODE_ENV === 'development'

config.reloadDB()
domain.reloadDB()

new Vue({
  router,
  store,
  i18n,
  vuetify,
  render: h => h(App)
}).$mount("#app");
