<template>
  <v-app>
    <drawer />
    <v-main class="main-content pl-0">
      <video-conference />
      <settings />
      <server-web-view />
      <organization-form />
      <video-fab />
      <about />
    </v-main>
  </v-app>
</template>

<script>
  import Drawer from '@/components/drawer'
  import DomainUtil from '@/utils/domain-util'
  import { get, sync } from 'vuex-pathify'
  import Settings from '@/views/Settings'
  import OrganizationForm from '@/views/OrganizationForm'
  import ServerWebView from '@/views/ServerWebView'
  import VideoConference from '@/views/video-conference'
  import VideoFab from '@/components/VideoFab'
  import About from '@/views/About'

  export default {
    name: 'App',

    components: {
      Drawer,
      Settings,
      OrganizationForm,
      ServerWebView,
      VideoConference,
      VideoFab,
      About,
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
        console.debug('serverId', curr, past)
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
  }
</script>
<style lang="sass">
  .app-panel.inactive
    display: none

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

