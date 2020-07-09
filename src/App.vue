<template>
  <v-app>
    <drawer />
    <!-- <settings-menu :show="!!settingsDrawer" /> -->
    <!-- <settings-menu /> -->
    <v-content class="main-content pl-0">
      <keep-alive>
        <component :is="currentComponent" />
      </keep-alive>
      <v-btn 
        v-if="videoActive"
        class="end-video-btn" 
        dark 
        fab 
        small
        color="error"
        @click="endVideo"
      >
        <v-icon dark>
          mdi-video-off
        </v-icon>
      </v-btn>
      <v-btn 
        v-if="videoActive"
        class="video-btn" 
        dark 
        fab 
        color="#a6d256"
        @click="showVideo"
      >
        <v-icon dark>
          mdi-video
        </v-icon>
      </v-btn>
    </v-content>
  </v-app>
</template>

<script>
  import Drawer from '@/components/Drawer'
  import DomainUtil from '@/utils/domain-util'
  import { get, sync } from 'vuex-pathify'

  export default {
    name: 'App',

    components: {
      Drawer,
    },

    data: () => ({
    }),

    computed: {
      serverId: get('settings/activeServerId'),
      ...get('settings', ['currentComponent', 'settingsDrawer', 'servers', 'activeServerIndex']),
      ...sync('settings', ['videoActive', 'lastServerId']),
    },

    watch: {
      serverId (curr, past) {
        console.log('serverId', curr, past)
        if (curr) {
          this.lastServerId = curr
        }
      },

      activeServerIndex (index, previous) {
        if (index !== previous && index !== undefined) {
          console.debug('activeServerIndex changed', index, previous)
          DomainUtil.updateMenu(this.servers, index)
        }
      },

      servers (servers) {
        if (servers) {
          console.debug('servers changed')
          DomainUtil.updateMenu(servers, this.activeServerIndex)
        }
      },
    },

    methods: {
      showVideo () {
        console.log('showVideo')
        this.$router.push({ path: '/video' })
      },

      endVideo () {
        this.videoActive = false
      },
    },
  }
</script>
<style lang="sass">
  .settings-page
    background-color: #eee
    width: 100%
    // margin-left: 60px

  .main-content
    background-color: #eee

  kbd 
    display: inline-block
    border: 1px solid #ccc !important
    border-radius: 3px
    font-size: 15px !important
    font-family: Courier New, Courier, monospace
    font-weight: bold !important
    white-space: nowrap
    background-color: #f7f7f7 !important
    color: #333 !important
    margin: 0 0.1em
    padding: 0.3em 0.8em !important
    text-shadow: 0 1px 0 #fff
    line-height: 1.4
  .video-btn
    position: absolute
    bottom: 20px
    right: 20px
  .end-video-btn
    position: absolute
    bottom: 20px
    right: 90px
</style>

