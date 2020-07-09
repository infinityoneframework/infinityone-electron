import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue"
import Settings from '@/views/Settings'
import Organizations from '@/views/Organizations'
import OrganizationForm from '@/views/OrganizationForm'
import ServerWebView from '@/views/ServerWebView'
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
  },
  {
    path: "/organizations",
    name: "Organizations",
    component: Organizations,
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
    default: 
      return name
  }
}

router.beforeEach((to, from, next) => {
  console.log('beforeEach', to, from)
  // console.log('store', store)
  const id = to.params.serverId
  const serverId = typeof id === 'string' ? parseInt(id) : id
  console.log('id, serverId', id, serverId)
  store.set('settings/activeServerId', serverId)

  const component = getComponent(to)
  console.log('component', component)
  store.set('settings/currentComponent', component)
  next()
})

export default router