<template>
  <v-main
    :class="`app-panel video-conference-view ${show}`"
  >
    <v-container
      fluid
      style="height: 100vh; width: 100%"
      class="ma-0 pa-0"
    >
      <webview
        id="video-container"
        style="height: 100%; width: 100%"
        :src="url"
        preload="file://./preload.js"
        disablewebsecurity
        remote-module
        partition="persist:webviewsession"
        webpreferences="allowRunningInsecureContent, javascript=yes"
        @close="closeHandler"
        @dom-ready="domReady"
      />
    </v-container>
  </v-main>
</template>
<script>
  import { get, sync } from 'vuex-pathify'

  const name = 'VideoConference'

  export default {
    name: name,

    computed: {
      ...get('video/*'),
      ...sync('settings', ['videoActive', 'videoClose']),
      ...get('settings', ['lastServerId', 'currentComponent', 'activeServerWebviewSelector']),
      show () {
        return this.currentComponent && this.currentComponent.name === name ? '' : 'inactive'
      },
    },

    watch: {
      url (current, previous) {
        console.debug('url change', current, previous)
        if (current && !previous) {
          new URL(current).searchParams.forEach((val, key) => {
            this.$store.set(`video/${key}`, val)
          })
          this.videoActive = true
        }
      },

      videoClose (current, previous) {
        console.debug('watch videoActive', current, previous)
        if (current && !previous) {
          const $el = document.querySelector('webview#video-container')
          console.debug('closing tab', $el)
          this.videoClose = false
          if ($el) {
            $el.executeJavaScript('window.close()')
          } else {
            console.warn('cannot find video container')
          }
        }
      }
    },

    methods: {
      closeHandler () {
        console.debug('closeHandler')
        const $el = document.querySelector('webview#video-container')

        if ($el) {
          this.videoActive = false
          this.$store.set('video/url', null)
          this.$router.push({ path: `/server/${this.lastServerId}` })
        } else {
          console.warn('cannot find video container')
        }
      },

      domReady () {
        console.debug('domReady')
      },
    },
  }
</script>
<style lang="sass" scoped>
  #video-container
    height: 100vh
    width: 100%
</style>

