<template>
  <v-app>
    <drawer />
    <v-content class="main-content">
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
// import HelloWorld from './components/HelloWorld'
import Drawer from '@/components/Drawer'

export default {
  name: 'App',

  components: {
    // HelloWorld,
    Drawer,
  },

  data: () => ({
    //
  }),
};
</script>
<style lang="sass">
  .settings-page
    margin-left: 60px
    background-color: #eee

  .main-content
    background-color: #eee
</style>

