<template>
  <v-main>
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
          @click.stop="currentComponent = item.component"
          v-text="item.title"
        />
      </v-tabs>
      <section class="settings-page pa-0">
        <component :is="currentComponent" />
      </section>
    </v-container>
  </v-main>
</template>
<script>
  import General from '@/views/settings/General'
  import Servers from '@/views/settings/Servers'
  import Network from '@/views/settings/Network'
  import Shortcuts from '@/views/settings/Shortcuts'

  export default {
    name: 'Settings',
    components: {
    },

    data: () => ({
      currentComponent: General,
      tabs: [
        { name: "general", title: "General", to: "/settings", component: General },
        { name: "network", title: "Network", to: "/network", component: Network },
        { name: "organizations", title: "Organizations", to: "/servers", component: Servers },
        { name: "shortcuts", title: "Shortcuts", to: "/shortcuts", component: Shortcuts },
      ],
      tab: 'general',
    }),
  }
</script>
<style lang="sass">
  .settings-card, .settings-card .v-card__title, .settings-card .v-card__text
    background-color: #eee
  //
</style>

