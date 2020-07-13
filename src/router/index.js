import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue"
import Settings from '@/views/Settings'
import Servers from '@/views/settings/Servers'
import General from '@/views/settings/General'
import OrganizationForm from '@/views/OrganizationForm'
import ServerWebView from '@/views/ServerWebView'
import VideoWindow from '@/views/VideoWindow'
import store from '@/store'

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    meta: { settings: true, component: General },
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
    name: "VideoWindow",
    component: VideoWindow,
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
    case 'Home':
      return Home
    case 'AddServer':
      return OrganizationForm
    case 'Organizations':
      return Settings
    case 'OrganizationForm':
      return OrganizationForm
    case 'VideoWindow':
      return VideoWindow
    default: 
      return name
  }
}

router.beforeEach((to, from, next) => {
  console.log('beforeEach', to, from, next)
  // console.log('store', store)
  const id = to.params.serverId
  const serverId = typeof id === 'string' ? parseInt(id) : id
  console.log('id, serverId', id, serverId)
  store.set('settings/activeServerId', serverId)

  const component = getComponent(to)
  console.warn('component', component)
  store.set('settings/currentComponent', component)

  store.set('settings/settingsDrawer', !!to.meta.settings)
  // next(new Error(''))
})

export default router