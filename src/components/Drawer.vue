<template>
  <v-navigation-drawer
    mini-variant
    mini-variant-width="60"
    permanent
    dark
    app
  >
    <v-layout
      align-center
      justify-space-between
      column
      fill-height
    >
      <v-list dense>
        <v-list-item
          v-for="(item, inx) in list"
          :key="inx"
          link
        >
          <v-list-item-icon>
            <v-img
              :src="require('../assets/icon-server.png')"
              height="30"
              width="30"
            />
          </v-list-item-icon>
        </v-list-item>
        <v-list-item
          to="/organization/new"
        >
          <v-list-item-icon>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-icon>
        </v-list-item>
      </v-list>
      <v-list 
        justify-end
        dense
      >
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :to="item.to"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
        </v-list-item>
      </v-list>
    </v-layout>
  </v-navigation-drawer>
</template>
<script>
import { sync } from "vuex-pathify"

export default {
  name: 'Drawer',

  data: () => ({
    items: [
      { icon: 'mdi-reload', title: 'Reload', to: '' },
      { icon: 'mdi-settings', title: 'Settings', to: '/settings' },
    ],
  }),

  computed: {
    list: sync('organizations/list'),
  },
}
</script>
<style lang="sass" scoped>
  //
</style>
