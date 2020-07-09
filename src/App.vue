<template>
  <v-app>
    <drawer />
    <v-content class="main-content">
      <keep-alive>
        <component :is="currentComponent" />
      </keep-alive>
      <!-- <router-view v-else /> -->
    </v-content>
  </v-app>
</template>

<script>
  // import HelloWorld from './components/HelloWorld'
  import Drawer from '@/components/Drawer'
  import Home from "@/views/Home.vue"
  import ServerWebView from '@/views/ServerWebView'
  import Settings from '@/views/Settings'
  import Organizations from '@/views/Organizations'
  import OrganizationForm from '@/views/OrganizationForm'
  import { get } from 'vuex-pathify'

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

  export default {
    name: 'App',

    components: {
      // HelloWorld,
      Drawer,
      ServerWebView,
      Settings,
      Organizations,
      OrganizationForm,
    },

    data: () => ({
      // serverId: null,
      // currentComponent: null,
    }),

    computed: {
      serverId: get('settings/activeServerId'),
      serverComponent: () => ServerWebView,
      currentComponent: get('settings/currentComponent'),
    },

    beforeRouteUpdate (to, from, next) {
      console.log('... 1', to.name, this.currentComponent)
      this.currentComponent = getComponent(to)
      console.log('... 2', this.currentComponent)
      next()
    },

    beforeRouteEnter (to, from, next) {
      console.log('beforeRouteEnter', to)
      next(vm => {
        const component = getComponent(to)
        console.log('... 0', to.name, component)
        vm.currentComponent = component
        return vm
      })
    },

    beforeMounted () {
      const to = this.$route.to
      console.log('beforeMounted', to, this)
      const component = getComponent(to)
      console.log('... 0', to.name, component)
      this.currentComponent = component
    },

    // beforeRouteUpdate (to, from, next) {
    //   console.log('beforeRouteUpdate', to, from)
    //   next()
    // },

    //   console.log('beforeMount', this.$route)
    //   if (this.$route.name === 'server') {
    //     const serverId = this.$route.params.serverId
    //     const id = typeof serverId === 'string' ? parseInt(serverId) : serverId
    //     this.serverId = id
    //     return
    //   }
    //   this.serverId = null
    // },

    // mounted () {
    //   console.log('mounted', this.$route)
    //   if (this.$route.name === 'server') {
    //     const serverId = this.$route.params.serverId
    //     const id = typeof serverId === 'string' ? parseInt(serverId) : serverId
    //     this.serverId = id
    //     return
    //   }
    //   this.serverId = null
    // },

    // beforeUpdate () {
    //   console.log('beforUpdate', this.$route)
    //   if (this.$route.name === 'server') {
    //     const serverId = this.$route.params.serverId
    //     const id = typeof serverId === 'string' ? parseInt(serverId) : serverId
    //     this.serverId = id
    //     return
    //   }
    //   this.serverId = null

    // },
  }
</script>
<style lang="sass">
  .settings-page
    margin-left: 60px
    background-color: #eee

  .main-content
    background-color: #eee
</style>

