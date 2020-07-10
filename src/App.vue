<template>
  <v-app>
    <drawer />
    <!-- <settings-menu :show="!!settingsDrawer" /> -->
    <!-- <settings-menu /> -->
    <v-content class="main-content pl-0">
      <keep-alive>
        <component :is="currentComponent" />
      </keep-alive>
    </v-content>
  </v-app>
</template>

<script>
  import Drawer from '@/components/Drawer'
  import { get } from 'vuex-pathify'

  export default {
    name: 'App',

    components: {
      Drawer,
    },

    data: () => ({
    }),

    computed: {
      serverId: get('settings/activeServerId'),
      currentComponent: get('settings/currentComponent'),
      settingsDrawer: get('settings/settingsDrawer'),
    },
  }
</script>
<style lang="sass">
  .settings-page
    background-color: #eee
    width: 100%
    // margin-left: 60px

  .main-content
    background-color: #eee

  kbd 
    display: inline-block
    border: 1px solid #ccc !important
    border-radius: 3px
    font-size: 15px !important
    font-family: Courier New, Courier, monospace
    font-weight: bold !important
    white-space: nowrap
    background-color: #f7f7f7 !important
    color: #333 !important
    margin: 0 0.1em
    padding: 0.3em 0.8em !important
    text-shadow: 0 1px 0 #fff
    line-height: 1.4
</style>

