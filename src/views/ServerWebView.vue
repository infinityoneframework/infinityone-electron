<template>
  <v-main class="server-view">
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
        :src="server.url"
        :node-integration="nodeIntegration"
        disablewebsecurity
        remote-module
        partition="persist:webviewsession"
        webpreferences="allowRunningInsecureContent, javascript=yes"
      />
    </v-container>
  </v-main>
</template>
<script>
  import { get } from 'vuex-pathify'

  export default {
    name: 'ServerWebView',
    props: {
      // serverId: {
      //   type: Number,
      //   required: true,
      // },
    },
    data: () => ({
      date: new Date(),
      nodeIntegration: true,
      tabIndex: 0,
      preload: false,
    }),
    computed: {
      serverIds: get('settings/serverIds'),
      // server () {
      //   return get(`settings/servers@[${this.index}]`)
      // },
      // index () {
      //   return this.serverIds[this.serverId]
      // },
      ...get('settings', ['servers', 'activeServerId']),
    },
  
    mounted () {
      console.log('View mounted')
    },

    updated () {
      console.log('View updated')
    },

    beforeDestroy () {
      console.log('View beforeDestroy')
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
    padding-left: 60px
    &.disabled
      display: none
</style>

