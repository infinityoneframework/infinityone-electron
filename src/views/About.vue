<template>
  <div>
    <v-container
      :class="`px-0 pl-0 ${show}`"
      style="margin-left: 70px !important"
    >
      <back-button />
    </v-container>
    <v-main
      id="about-view"
      :class="`about app-panel settings-page pl-0 ${show}`"
    >
      <v-img
        :src="require('@/assets/infinityone.png')"
        class="logo"
        width="150"
      />
      <p
        class="detail"
        v-text="version()"
      />
      <div class="maintenance-info">
        <p class="detail maintainer">
          {{ $t('Maintained by') }}
          <a
            @click="linkInBrowser('website')"
          >
            InfinityOne
          </a>
        </p>
        <p class="detail license">
          {{ $t('Available under the') }}
          <a
            @click="linkInBrowser('license')"
          >
            {{ $t('license') }}
          </a>
        </p>
      </div>
    </v-main>
  </div>
</template>
<script>
  import { get } from 'vuex-pathify'
  import BackButton from '@/components/BackButton'

  const { app } = require('electron').remote
  const { shell } = require('electron')
  const isDev = require('electron-is-dev')
  const name = "About"

  export default {
    name: name,

    components: {
      BackButton,
    },

    computed: {
      aboutOpen: get('settings/aboutOpen'),
      currentComponent: get('settings/currentComponent'),
      show () {
        return this.currentComponent && this.currentComponent.name === name ? '' : 'inactive'
      },
    },

    methods: {
      linkInBrowser (type) {
        let url

        switch (type) {
          case 'website':
            url = 'https://emetrotel.com'
            break
          case 'license':
            url = "https://github.com/infinityoneframework/infinityone-electron/blob/master/LICENSE"
            break
          default:
            url = 'https://github.com/infinityoneframework/infinityone-electron/issues/new?body=' +
              '%3C!--Please%20describe%20your%20issue%20and%20steps%20to%20reproduce%20it.--%3E'
        }
        shell.openExternal(url)
      },
      version () {
        const env = isDev ? ' (Dev)'  : ''
        return 'v' + app.getVersion() + env
      },
    },

  }
</script>
<style lang="sass" scoped>
  body
    background: #fafafa
    font-family: menu, "Helvetica Neue", sans-serif
    -webkit-font-smoothing: subpixel-antialiased

  .inactive
    display: none

  .logo
    display: block
    margin: -40px auto 20px auto

  #version
    color: #444343
    font-size: 1.3em
    padding-top: 40px

  .about
    margin: 25vh auto
    height: 25vh
    text-align: center

  .about p
    font-size: 20px
    color: rgba(0, 0, 0, 0.62)

  .about img
    width: 150px

  .detail
    text-align: center

  .detail.maintainer
    font-size: 1.2em
    font-weight: 500

  .detail.license
    font-size: 0.8em

  .maintenance-info
    cursor: pointer
    position: absolute
    width: 100%
    left: 0px
    color: #444

  .maintenance-info p
    margin: 0
    font-size: 1em
    width: 100%

  .maintenance-info .bug
    display: inline-block
    padding: 8px 15px
    margin-top: 30px
    text-decoration: none
    background-color: #87b530
    /*background-color: #52c2af*/
    color: #fff
    border-radius: 4px

    transition: background-color 0.2s ease

  .maintenance-info .bug:hover
    background-color: #698d25

  p.detail a
    color: #5a7920

  p.detail a:hover
    text-decoration: underline
</style>
