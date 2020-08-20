<template>
  <v-list-item
    v-if="showAbout"
    to="/about"
    :class="`nav-tab about ${activeClass}`"
    @mouseover="aboutHover=true"
    @mouseleave="aboutHover=false"
  >
    <v-list-item-icon>
      <v-icon>mdi-information-outline</v-icon>
      <v-icon
        v-if="aboutHover"
        style="position:absolute;top:0;right:0"
        color="error"
        size="20"
        @click.prevent="closeAbout"
      >
        mdi-close-circle
      </v-icon>
    </v-list-item-icon>
  </v-list-item>
</template>
<script>
  import { get, sync } from 'vuex-pathify'

  const name = 'About'

  export default {
    name: name,

    data: () => ({
      aboutHover: false,
    }),

    computed: {
      ...get('settings', ['currentComponent', 'lastServerId']),
      firstServer: get('settings/servers@[0]'),
      aboutOpen: sync('settings/aboutOpen'),
      tabActive () {
        return this.currentComponent && this.currentComponent.name === name
      },
      activeClass () {
        return this.tabActive ? 'active' : ''
      },
      showAbout () {
        return this.tabActive || this.aboutOpen
      },
    },

    watch: {
      currentComponent (curr, prev) {
        if (curr && curr.name === name && prev && prev.name !== name) {
          this.aboutOpen = true
        }
      },
    },

    methods: {
      closeAbout () {
        const serverId = this.lastServerId || this.firstServer.serverId
        this.aboutOpen = false
        this.aboutHover = false
        this.$router.push({ path: `/server/${serverId}`})
      }
    },
  }
</script>
<style lang="sass" scoped>
  //
</style>
