<template>
  <div class="video-fab">
    <v-btn
      v-if="show"
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
      v-if="show"
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
  </div>
</template>
<script>
  import { get, sync } from 'vuex-pathify'

  export default {
    name: 'VideoFab',

    computed: {
      ...get('settings', ['currentComponent']),
      ...sync('settings', ['videoActive', 'lastServerId', 'videoClose']),
      show () {
        const name = this.currentComponent && this.currentComponent.name
        return this.videoActive && name !== 'VideoConference'
      },
    },

    methods: {
      endVideo () {
        this.videoClose = true
      },

      showVideo () {
        console.debug('showVideo')
        if (this.videoActive) {
          this.$router.push({ path: '/video' })
        }
      },
    },
  }
</script>
<style lang="sass" scoped>
  //
</style>

