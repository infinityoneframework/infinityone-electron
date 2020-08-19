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
      <webview
        v-for="(server, inx) in servers"
        :key="server.serverId"
        :class="`server-view ${server.serverId === activeServerId ? 'enabled' : 'disabled'}`"
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
        @new-window="newWindow"
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
      url: sync('video/url'),
      ...get('settings', ['servers', 'activeServerId', 'currentComponent']),
      show () {
        return this.currentComponent && this.currentComponent.name === name ? '' : 'inactive'
      },
    },

    methods: {
      newWindow (e) {
        console.debug('newWindow', e)
        if (e.url.match(/video\?/)) {
          this.url = e.url.replace('video', 'desktop')
          this.$router.push({ path: '/video' })
        }
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

