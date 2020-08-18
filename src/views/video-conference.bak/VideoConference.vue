<template>
  <v-main
    :class="`app-panel video-conference-view ${show}`"
  >
    <v-container
      fluid
      style="height: 100vh; width: 100%"
      class="ma-0 pa-0"
    >
      <div id="video-container" />
    </v-container>
  </v-main>
</template>
<script>
  import JitsiMeetExternalAPI from '@/external_api'
  import { get, sync } from 'vuex-pathify'

  const name = 'VideoConference'
  const ENABLE_REMOTE_CONTROL = false
  const ENABLE_SCREEN_SHARING = true

  export default {
    name: name,

    data: () => ({
      api: null,
      alwaysOnTopWindowEnabled: false,
    }),

    computed: {
      ...get('video/*'),
      ...sync('settings', ['videoActive']),
      ...get('settings', ['lastServerId', 'currentComponent', 'activeServerWebviewSelector']),
      show () {
        return this.currentComponent && this.currentComponent.name === name ? '' : 'inactive'
      },
    },

    watch: {
      url (current, previous) {
        console.log('url change', current, previous)
        if (current && !previous) {
          new URL(current).searchParams.forEach((val, key) => {
            this.$store.set(`video/${key}`, val)
          })
          this.videoActive = true
          this.loadConference()
        }
      }
    },

    methods: {
      loadConference () {
        const options = {
          roomName: this.roomName,
          noSsl: false,
          // noSsl: this.noSsl,
          parentNode: document.querySelector('#video-container'),
          userInfo: {
            displayName: this.username,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          },
        }

        console.warn('loadConference', this.domain, options)

        const api = new JitsiMeetExternalAPI(this.domain, options)

        api.on('videoConferenceJoined', this.onVideoConferenceJoined)
        api.on('videoConferenceLeft', this.onVideoConferenceLeft)
        api.on('readyToClose', this.onVideoConferenceEnded)
        api.on('suspendDetected', this.onVideoConferenceEnded)

        api.executeCommand('displayName', this.username)
        api.executeCommand('avatarUrl', this.avatarUrl)
        api.executeCommand('subject', this.displayName)

        // document.getElementById('jitsiConferenceFrame0').setAttribute('referrerpolicy', 'no-referrer')
        // document.getElementById('jitsiConferenceFrame0').csp = "frame-src 'self' http://localhost"

        const { RemoteControl,
            setupScreenSharingRender,
            setupAlwaysOnTopRender,
            initPopupsConfigurationRender,
            // setupWiFiStats,
            // setupPowerMonitorRender
        } = window.jitsiNodeAPI.jitsiMeetElectronUtils;

        // const { RemoteControl,
        //     setupScreenSharingRender,
        //     setupAlwaysOnTopRender,
        //     initPopupsConfigurationRender,
        //     setupWiFiStats,
        //     setupPowerMonitorRender
        // } = require('jitsi-meet-electron-utils')

        initPopupsConfigurationRender(api);

        const iframe = api.getIFrame();

        console.log('iframe', iframe)

        if (ENABLE_SCREEN_SHARING) {
          setupScreenSharingRender(api);
        }

        if (ENABLE_REMOTE_CONTROL) {
            new RemoteControl(iframe); // eslint-disable-line no-new
        }

        // Allow window to be on top if enabled in settings
        if (this.alwaysOnTopWindowEnabled) {
            setupAlwaysOnTopRender(api);
        }

        // setupWiFiStats(iframe);
        // setupPowerMonitorRender(api);

        this.api = api

        // const videoConferenceJoined = event => {
        //   console.debug('videoConferenceJoined', event)
        //   parent && parent.videoConferenceJoined(event)
        // }

        // const videoConferenceLeft = event => {
        //   try {
        //     console.debug('videoConferenceLeft', event)
        //     parent && parent.videoConferenceLeft(event)
        //   }
        //   catch (error) {
        //     console.warn('failed videoConferenceLeft', error, event)
        //   }
        //   finally {
        //     window.close()
        //   }
        // }

      },

      onVideoConferenceJoined (e) {
        console.warn('onVideoConferenceJoined', e)
      },

      onVideoConferenceLeft (e) {
        console.warn('onVideoConferenceLeft', e)
      },

      onVideoConferenceEnded (e) {
        console.warn('onVideoConferenceEnded', e)
      },
    },
  }
</script>
<style lang="sass" scoped>
  #video-container
    height: 100vh
    width: 100%
</style>

