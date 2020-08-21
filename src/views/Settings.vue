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
          :value="item.component.name"
          @click.stop="setComponent(item.component)"
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
      value: General.name,
      change: false,
    }),

    computed: {
      currentComponent: get('settings/currentComponent'),
      show () {
        return this.currentComponent && this.currentComponent.name === 'Settings' ? '' : 'inactive'
      },
    },

    watch: {
      $route (to, from) {
        console.log('route change', to, from)
      },
      component (curr, prev) {
        console.log('component change', curr && curr.name, prev && prev.name, this.value)
      }
    },

    beforeUpdate () {
      // this functionality is a little confusing. The following allows the required tab to be
      // shown when coming from a direct route. However, this function is interacting with the
      // correct functionality when a tab is clicked. So, this.value is true when a tab is clicked,
      // but not when we navigate from a route.
      // Furthermore, this.value is used to ensure that the corret tab is marked active when
      // coming from a route.
      const history = this.$router.history
      const meta = history && history.pending && history.pending.meta
      if (meta && meta.settings && !this.change) {
        this.component = meta.component || General
        this.value = this.component.name
      }
      this.change = false
    },

    methods: {
      setComponent (component) {
        this.component = component
        this.value = component.name
        this.change = true
      },
    },
  }
</script>
<style lang="sass">
  .settings-card, .settings-card .v-card__title, .settings-card .v-card__text
    background-color: #eee
</style>

