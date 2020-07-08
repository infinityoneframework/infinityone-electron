<template>
  <v-app>
    <drawer />
    <v-content>
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
