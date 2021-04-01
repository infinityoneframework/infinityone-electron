import VueNotification from './VueNotification/index'
import Vue from 'vue'

Vue.use(VueNotification, {
  timer: 5,
  error: {
    background: '#ff5252',
    color: 'white',
  },
  success: {
    background: '#4caf50',
    color: 'white',
  },
  warning: {
    background: '#fb8c00',
    color: 'white',
  },
})
