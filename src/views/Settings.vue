<template>
  <v-main class="settings-page pl-0">
    <v-container 
      class="fill-height pt-0 pl-0"
      fluid
    >
      <!-- -->
      <settings-menu />
      <h2>Settings page</h2>
    </v-container>
  </v-main>
</template>
<script>
  import SettingsMenu from '@/components/SettingsMenu'
  export default {
    name: 'Settings',
    components: {
      SettingsMenu
    },
  }
</script>
<style lang="sass" scoped>
  //
</style>

