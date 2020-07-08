<template>
  <v-navigation-drawer 
    style="background-color: #f2f2f2; min-height:100vh;margin-left: 60px"
    permanent
    app
  >
    <v-list dense>
      <v-list-item
        v-for="(item, inx) in items"
        :key="inx"
        :to="item.to"
      >
        <v-list-item-content>
          <v-list-item-title v-text="item.title" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
export default {
  name: 'Empty',
  data: () => ({
    items: [
      { name: "general", title: "General", to: "/settings" },
      { name: "network", title: "Network", to: "/network" },
      { name: "organizations", title: "Organizations", to: "/organizations" },
      { name: "shortcuts", title: "Shortcuts", to: "/shortcuts"},
    ],
  }),
}
</script>
<style lang="sass" scoped>
  //
  #settings-menu 
    background-color: #999
</style>
