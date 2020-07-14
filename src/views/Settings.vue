<template>
  <v-main
    id="settings-view"
    :class="`app-panel ${show}`"
  >
    <v-container
      class="fill-height pa-0"
      fluid
    >
      <v-tabs
        v-model="tab"
      >
        <v-tab
          v-for="item in tabs"
          :key="item.name"
          @click.stop="component = item.component"
          v-text="item.title"
        />
      </v-tabs>
      <section class="settings-page pa-0">
        <component :is="component" />
      </section>
    </v-container>
  </v-main>
</template>
<script>
  import General from '@/views/settings/General'
  import Servers from '@/views/settings/Servers'
  import Network from '@/views/settings/Network'
  import Shortcuts from '@/views/settings/Shortcuts'
  import { get } from 'vuex-pathify'

  // const components = [General, Servers, Network, Shortcuts]

  export default {
    name: 'Settings',
    components: {
    },

    data: () => ({
      tabs: [
        { name: "general", title: "General", to: "/settings", component: General },
        { name: "network", title: "Network", to: "/network", component: Network },
        { name: "organizations", title: "Organizations", to: "/servers", component: Servers },
        { name: "shortcuts", title: "Shortcuts", to: "/shortcuts", component: Shortcuts },
      ],
      tab: 'general',
      component: General,
    }),

    computed: {
      currentComponent: get('settings/currentComponent'),
      show () {
        return this.currentComponent && this.currentComponent.name === 'Settings' ? '' : 'inactive'
      },
    },

    watch: {
      currentComponent (curr, prev) {
        console.warn('curr', curr, prev)
      },
    },
  }
</script>
<style lang="sass">
  .settings-card, .settings-card .v-card__title, .settings-card .v-card__text
    background-color: #eee
</style>

