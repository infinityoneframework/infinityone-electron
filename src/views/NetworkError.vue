<template>
  <v-main
    :class="`app-panel server-view ${show}`"
    :data-show="show"
  >
    <v-container
      class="fill-height px-0 pl-0"
      style="padding-top: 100px; padding-right: 60px !important"
      fluid
    >
      <v-card
        width="50%"
        class="mx-auto"
      >
        <v-card-text style="text-align:center">
          <div id="picture">
            <v-img
              :src="require('@/assets/infinityone_network.png')"
              width="300"
              class="mx-auto"
            />
          </div>
          <div id="title">
            {{ $t("InfinityOne can't connect") }}
          </div>
          <div id="description">
            <div>{{ $t('Your computer seems to be offline.') }}</div>
            <div>{{ $t('We will keep trying to reconnect, or you can try now.') }}</div>
          </div>
          <v-btn
            id="reconnect"
            class="mt-2"
            color="rgb(90,121,32)"
            text
            @click="reconnect"
          >
            {{ $t('Try now') }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>
<script>
  import { get } from 'vuex-pathify'
  import { ipcRenderer } from 'electron'
  import DomainUtil from '@/utils/domain-util'

  const name = 'NetworkError'
  const debug = false

  export default {
    name: name,

    data: () => ({
      timerRef: null,
      retryCount: 0,
    }),

    computed: {
      ...get('settings', ['activeServerId', 'currentComponent', 'networkErrors']),
      isActive () {
        return this.currentComponent && this.currentComponent.name === name
      },
      show () {
        return this.isActive ? '' : 'inactive'
      },
    },

    watch: {
      networkErrors (curr) {
        if (!this.isNetworkErrors(curr)) {
          if (this.timerRef) {
            clearTimeout(this.timerRef)
            this.timerRef = null
            if (this.isActive) {
              DomainUtil.openDomain()
            }
          }
        } else {
          if (!this.timerRef) {
            this.startTimer()
          }
        }
      }
    },

    methods: {
      isNetworkErrors (errors) {
        return errors && Object.keys(errors).length > 0
      },

      startTimer () {
        this.timerRef = null
        if (this.isNetworkErrors(this.networkErrors)) {
          this.retryCount = this.retryCount + 1
          this.timerRef = setTimeout(() => {
            if (this.isNetworkErrors(this.networkErrors)) {
              this.startTimer()
              DomainUtil.checkDisabled()
            } else {
              if (debug) { console.debug('no errors', this.networkErrors) }
            }
          }, DomainUtil.serverRetryTicks(this.retryCount))
        }
      },

      reconnect () {
        if (debug) { console.debug('click reconnect') }
        ipcRenderer.send('forward-message', 'reload-viewer', Object.keys(this.networkErrors))
      },
    },
  }
</script>
<style lang="sass" scoped>
  #title
    font-size: larger
    margin: 20px 0
    font-weight: bold
</style>
