<template>
  <v-main
    :class="`app-panel server-view ${show}`"
    :data-show="show"
  >
    <v-container
      fluid
      style="height: 100vh; width: 100%"
      class="ma-0 pa-0"
    >
      <!-- <v-btn @click="test">Test</v-btn> -->
      <webview
        v-for="(server, inx) in servers"
        :key="server.serverId"
        :class="`server-view ${server.serverId === activeServerId ? '' : 'disabled'}`"
        style="height: 100%; width: 100%"
        :data-tab-id="inx"
        :data-server-id="server.serverId"
        :src="server.url"
        :node-integration="nodeIntegration"
        preload="file://./preload.js"
        disablewebsecurity
        remote-module
        partition="persist:webviewsession"
        webpreferences="allowRunningInsecureContent, javascript=yes"
      />
    </v-container>
  </v-main>
</template>
<script>
  import { get, sync } from 'vuex-pathify'

  const name = 'ServerWebView'

  export default {
    name: name,

    data: () => ({
      date: new Date(),
      nodeIntegration: true,
      tabIndex: 0,
      preload: false,
      $elList: [],
    }),

    computed: {
      serverIds: get('settings/serverIds'),
      ...get('settings', ['servers', 'activeServerId', 'currentComponent']),
      ...sync('settings', ['videoUrl', 'videoActive']),
      show () {
        return this.currentComponent && this.currentComponent.name === name ? '' : 'inactive'
      },
    },

    mounted () {
      console.debug('View mounted')
      const $elList = document.querySelectorAll('webview.server-view')
      this.$elList = $elList

      setTimeout(() => {
        $elList.forEach(item => {
          item.executeJavaScript('window.isElectron = true')
          item.addEventListener('dom-ready', () => {
            item.executeJavaScript('window.isElectron = true')
          })
          item.addEventListener('new-window', (e) => {
            // const parsed = require('url').parse(e.url)
            const protocol = require('url').parse(e.url).protocol
            console.log('new-window', protocol, e)
            if (e.url.match(/video\?/)) {
              this.videoUrl = e.url
              this.videoActive = true
              this.$router.push({ path: '/video' })
            }
          })
        })
      }, 1000)
    },

    updated () {
      console.debug('View updated')
    },

    beforeDestroy () {
      console.debug('View beforeDestroy')
    },

    methods: {
      test () {
        const ctl = document.getElementById('server-view')
        console.log('web view', ctl)
        // console.log('server', this.server())
      },
    },
  }
</script>
<style lang="sass" scoped>
  //
  .server-view
    // margin-left: 60px
    // padding-left: 60px
    &.disabled
      display: none
</style>

