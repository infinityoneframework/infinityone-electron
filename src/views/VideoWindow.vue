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
      ...get('settings', ['videoUrl', 'lastServerId', 'currentComponent']),
      videoActive: sync('settings/videoActive'),
      show () {
        return this.currentComponent && this.currentComponent.name === name ? '' : 'inactive'
      },
    },

    beforeDestroy () {
      console.log('beforeDestroy')
    },

    mounted () {
      const $el = document.querySelector('webview.video-view')
      console.debug('View mounted', $el)
      this.$el = $el

      const closeWindow = () => {
        this.videoActive = false
        if (this.lastServerId) {
          this.$router.push({ path: `/server/${this.lastServerId}` })
        }
      }

      setTimeout(() => {
        $el.addEventListener('close', () => {
          console.log('video closed...')
          closeWindow()
        })
      }, 1000)
    },
  }
</script>
<style lang="sass" scoped>
  //
</style>

