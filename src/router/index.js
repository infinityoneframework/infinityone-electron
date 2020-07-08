import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue"
import Settings from '@/views/Settings'
import Organizations from '@/views/Organizations'
import OrganizationForm from '@/views/OrganizationForm'

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
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
})

export default router
