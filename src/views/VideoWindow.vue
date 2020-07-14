<template>
  <v-main
    :class="`app-panel server-view ${show}`"
  >
    <v-container
      fluid
      style="height: 100vh; width: 100%"
      class="ma-0 pa-0"
    >
      <!-- <v-btn @click="test">Test</v-btn> -->
      <webview
        v-if="videoActive"
        key="video"
        class="video-view"
        style="height: 100%; width: 100%"
        data-tab-id="video"
        :src="videoUrl"
        :node-integration="nodeIntegration"
        disablewebsecurity
        remote-module
        partition="persist:webviewsession"
        webpreferences="allowRunningInsecureContent, javascript=yes"
        @dom-ready="domReady"
        @close="closeWindow"
      />
    </v-container>
  </v-main>
</template>
<script>
  import { get, sync } from 'vuex-pathify'

  const name = 'VideoWindow'

  export default {
    name: name,

    data: () => ({
      nodeIntegration: true,
      $el: null,
    }),

    computed: {
      ...get('settings', ['videoUrl', 'lastServerId', 'currentComponent', 'activeServerWebviewSelector']),
      videoActive: sync('settings/videoActive'),
      show () {
        return this.currentComponent && this.currentComponent.name === name ? '' : 'inactive'
      },
    },

    // beforeDestroy () {
    //   console.log('beforeDestroy')
    // },

    // mounted () {
    //   const $el = document.querySelector('webview.video-view')
    //   console.debug('View mounted', $el)
    //   this.$el = $el

    //   const closeWindow = () => {
    //     this.videoActive = false
    //     if (this.lastServerId) {
    //       this.$router.push({ path: `/server/${this.lastServerId}` })
    //     }
    //   }

    //   setTimeout(() => {
    //     $el.addEventListener('close', () => {
    //       console.log('video closed...')
    //       closeWindow()
    //     })
    //   }, 1000)
    // },

    watch: {
      videoActive (current, previous) {
        if (previous && !current) {
          console.warn('videoActive change', this.$el)
          if (this.$el) {
            // this.$el.close()
          }
        }
      }
    },
    // watch: {
    //   videoActive (current) {
    //     console.log('videoActive change', current)
    //     if (current) {
    //       const $el = document.querySelector('webview.video-view')
    //       console.debug('View mounted', $el)
    //       this.$el = $el
    //       if (!$el) {
    //         console.warn('webview.view-view null')
    //         return
    //       }

    //       // const closeWindow = () => {
    //       //   this.videoActive = false
    //       //   if (this.lastServerId) {
    //       //     this.$router.push({ path: `/server/${this.lastServerId}` })
    //       //   }
    //       // }

    //       const eventListener = this.closeEventListener

    //       setTimeout(() => {
    //         $el.addEventListener('close', eventListener)
    //         // $el.addEventListener('close', () => {
    //         //   console.log('video closed...')
    //         //   closeWindow()
    //         // })
    //       }, 1000)
    //       return
    //     }

    //     if (this.$el) {
    //       this.$el.removeEventListener('close', this.closeEventListener)
    //       this.$el = null
    //     }
    //   }
    // },

    methods: {
      closeWindow () {
        console.warn('closeWindow', this.$el, this.videoActive)
        this.videoActive = false
        this.$el = null
        if (this.lastServerId) {
          this.$router.push({ path: `/server/${this.lastServerId}` })
        }
      },

      closeEventListener () {
        const closeWindow = this.closeWindow
        console.log('video closed listener')
        closeWindow()
      },

      domReady () {
        console.warn('domReady...')
        const msg = '{ avatarURL: "https://one-lab.spallen.me/avatar/steve", displayName: "steve", formattedDisplayName: "steve (me)", id: "5b286d", roomName: "InfinityOneGQwrEI_OEeqCR1JUALl__w--Accounting" }'

        const $el = document.querySelector('webview.video-view')
        const selector = this.activeServerWebviewSelector
        console.warn('selector', selector)
        const $parent = document.querySelector(selector)
        console.warn('$parent', $parent)
        // const $window = $el.executeJavaScript('window')
        // console.warn('$window', $window)
        $parent.executeJavaScript(`window.OneChat.videoMeeting.videoConferenceJoined(${msg})`)

        // console.debug('View mounted', $el)
        if (!$el) {
          console.warn('webview.view-view null')
          return
        }

        this.$el = $el
      },
    },
  }
</script>
<style lang="sass" scoped>
  //
</style>

