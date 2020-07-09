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
    // margin-left: 60px

  .main-content
    background-color: #eee
</style>

