import Vue from "vue";
import store from '@/store'
import VueRouter from "vue-router"
import Settings from '@/views/Settings'
import Servers from '@/views/settings/Servers'
import General from '@/views/settings/General'
import Shortcuts from '@/views/settings/Shortcuts'
import OrganizationForm from '@/views/OrganizationForm'
import ServerWebView from '@/views/ServerWebView'
import VideoConference from '@/views/video-conference'
import About from '@/views/About'
import NetworkError from '@/views/NetworkError'

Vue.use(VueRouter)

const debug = false

const routes = [
  {
    path: "/about",
    name: "About",
    component: About
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    meta: { settings: true, component: General },
  },
  {
    path: "/shortcuts",
    name: "Shortcuts",
    component: Settings,
    meta: { settings: true, component: Shortcuts },
  },
  {
    path: '/servers/new',
    name: 'AddServer',
    component: OrganizationForm,
  },
  {
    path: "/servers",
    name: "Servers",
    component: Settings,
    meta: { settings: true, component: Servers},
  },
  {
    path: "/organization/new",
    name: "OrganizationForm",
    component: OrganizationForm,
  },
  {
    path: '/server/:serverId',
    name: "server",
    component: ServerWebView,
    props: (route) => {
      const serverId = Number.parseInt(route.params.serverId, 10)
      return { serverId }
    },
  },
  {
    path: "/video",
    name: "VideoConference",
    component: VideoConference,
  },
  {
    path: '/network_error',
    name: 'NetworkError',
    component: NetworkError
  },
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
})

const getComponent = ({ name }) => {
  switch (name) {
    case 'server':
      return ServerWebView
    case 'Settings':
      return Settings
    case 'AddServer':
      return OrganizationForm
    case 'Organizations':
      return Settings
    case 'OrganizationForm':
      return OrganizationForm
    case 'VideoConference':
      return VideoConference
    case 'About':
      return About
    case 'Shortcuts':
      return Settings
    case 'NetworkError':
      return NetworkError
    default:
      return name
  }
}

router.beforeEach((to, from, next) => {
  if (debug) { console.debug('beforeEach', to, from, next) }
  const id = to.params.serverId
  const serverId = typeof id === 'string' ? parseInt(id) : id
  store.set('settings/activeServerId', serverId)

  const component = getComponent(to)
  store.set('settings/currentComponent', component)

  store.set('settings/settingsDrawer', !!to.meta.settings)
})

export default router