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
      <template v-for="(server, inx) in servers">
        <div
          :key="`${inx}-0`"
          :class="`spinner ${showSpinner(server.serverId) ? 'show' : ''}`"
          :style="`background: #fff url(${require('@/assets/ic_loading.gif')}) no-repeat`"
        />

        <webview
          :key="server.serverId"
          :class="`server-view ${serverClass(server)}`"
          style="height: 100%; width: 100%"
          :data-tab-id="inx"
          :data-server-id="server.serverId"
          :src="server.url"
          :node-integration="nodeIntegration"
          disablewebsecurity
          :preload="getPreload()"
          remote-module
          partition="persist:webviewsession"
          webpreferences="allowRunningInsecureContent, javascript=yes"
          @new-window="newWindow"
          @page-title-updated="pageTitleUpdate"
          @did-fail-load="didFailLoad($event, server.serverId)"
          @did-finish-load="didFinishLoad($event, server.serverId)"
          @did-start-loading="didStartLoading(server.serverId)"
          @did-stop-loading="didFinishLoad($event, server.serverId)"
        />
      </template>
    </v-container>
  </v-main>
</template>
<script>
  import { ipcRenderer} from 'electron'
  import { get, sync } from 'vuex-pathify'
  import SystemUtil from '@/utils/system-util'
  import path from 'path'

  const name = 'ServerWebView'
  const debug = false
  const isDev = require('electron-is-dev')

  export default {
    name: name,

    data: () => ({
      date: new Date(),
      nodeIntegration: true,
      tabIndex: 0,
      preload: false,
      $elList: [],
      badges: {},
      badgeCount: 0,
      loaded: {},
    }),

    computed: {
      serverIds: get('settings/serverIds'),
      url: sync('video/url'),
      badgeCounts: sync('settings/badgeCounts'),
      ...get('settings', ['activeServerId', 'currentComponent']),
      servers: get('settings/enabledServers'),
      networkErrors: sync('settings/networkErrors'),
      silent: get('settings/config@silent'),
      showNotification: get('settings/config@showNotification'),
      show () {
        return this.isCurrentComponent ? '' : 'inactive'
      },
      isCurrentComponent () {
        return this.currentComponent && this.currentComponent.name === name
      },
      isNetworkError () {
        return !!this.getNetworkError
      },
      getNetworkError () {
        return this.networkErrors[this.activeServerId]
      },
      serverClass () {
        return server => {
          const serverId = server ? server.serverId : -1
          const onload = this.loaded[serverId] ? '' : ' onload'
          return serverId === this.activeServerId ? `enabled${onload}` : `disabled${onload}`
        }
      },
      showSpinner () {
        return id => !this.loaded[id] && this.activeServerId === id
      },
    },

    watch: {
      silent (curr, prev) {
        if (debug) {
          console.log('silent change', curr, prev)
        }
        this.onNotifierChange('sound', !curr)
      },

      showNotification (curr, prev) {
        if (debug) {
          console.log('showNotification change', curr, prev)
        }
        this.onNotifierChange('supported', curr)
      },

      networkErrors (curr, prev) {
        curr = Object.keys(curr)
        prev = Object.keys(prev)

        prev.forEach(id => {
          if (!curr.includes(id)) {
            if (debug) { console.debug('found a cleared id', id) }
            this.loadServer(id, $el => $el.reload())
          }
        })
      },
    },

    methods: {
      getPreload () {
        let preload

        if (isDev) {
          preload = path.join(process.cwd(), 'src', 'preload.js')
        } else {
          preload = path.join(__dirname, 'preload.js')
        }
        return `file://${preload}`
      },

      newWindow (e) {
        if (debug) { console.debug('newWindow', e) }

        if (e.url.match(/video\?/)) {
          this.url = e.url.replace('video', 'desktop')
          this.$router.push({ path: '/video' })
        }
      },

      updateBadgeCount () {
        this.badgeCounts = { ...this.badges }
        const oldCount = this.badgeCount
        const totalCount = Object.values(this.badges).reduce((a, b) => a + b, 0)
        this.badgeCount = totalCount
        if (oldCount !== totalCount) {
          // notify of a count change
          ipcRenderer.send('update-badge', totalCount)
        }
      },

      pageTitleUpdate (e) {
        if (e.title && e.title !== '') {
          const serverId = e.target.getAttribute('data-server-id')
          // console.warn('pageTitleUpdate', e.title, serverId)
          const match = e.title.match(/\((\d+)\)/)
          let count = 0
          if (match) {
            count = parseInt(match[1])
          }
          const badges = { ...this.badges }
          badges[serverId] = count
          this.badges = badges
          this.updateBadgeCount()
        }
      },

      didFinishLoad (event, serverId) {
        if (this.networkErrors[serverId]) {
          console.debug('network errors')
          return
        }
        this.setLoaded(serverId)
      },

      didFailLoad (event, serverId) {
        const { errorDescription } = event
        const hasConnectivityErr = (SystemUtil.connectivityERR.indexOf(errorDescription) >= 0)
        console.warn('dom-fail-load', event, errorDescription, hasConnectivityErr)
        if (hasConnectivityErr) {
          this.setNetworkError(serverId, errorDescription)
          setTimeout(() => {
            this.$router.push({ path: "/network_error" })
          }, 1000)
        }
      },

      didStartLoading (serverId) {
        const loaded = { ...this.loaded }
        delete loaded[serverId]
        this.loaded = { ...loaded }
      },

      setNetworkError (serverId, description) {
        const errors = { ...this.networkErrors }
        errors[serverId] = description

        this.networkErrors = errors
      },

      loadServer (serverId, callback) {
        const $el = this.setLoaded(serverId)
        if ($el && callback) {
          callback($el)
        }
      },

      setLoaded (serverId) {
        const $el = document.querySelector(`webview[data-server-id="${serverId}"]`)
        if ($el) {
          $el.classList.remove('onload')
          const loaded = { ...this.loaded }
          loaded[serverId] = true
          this.loaded = loaded
          this.setNotifierItem($el, 'sound', !this.silent)
          this.setNotifierItem($el, 'supported', this.showNotification)
          this.setNotifierItem($el, 'electron', true)
        }
        return $el
      },

      setNotifierItem ($el, item, value) {
        $el.executeJavaScript(`if (window.OneChat && window.OneChat.notifier) { window.OneChat.notifier.${item} = ${value} }`)
          .then(result => {
            if (debug) { console.log('done', item, result) }
          })
          .catch(error => {
            console.warn('error', $el, item, error)
          })
      },

      onNotifierChange (item, value) {
        const $elems = document.querySelectorAll(`webview[data-server-id]`)
        if ($elems) {
          $elems.forEach($el => {
            this.setNotifierItem($el, item, value)
          })
        }
      },
    },
  }
</script>
<style lang="sass" scoped>
  .server-view
    &.disabled
      display: none
        display: flex
    webview.onload
      opacity: 0
    .spinner
      display: none
      &.show
        display: block
        position: absolute
        top: 0
        bottom: 0
        right: 0
        left: 0
        background-size: 60px 60px !important
        background-position: center !important
        z-index: 100
</style>

