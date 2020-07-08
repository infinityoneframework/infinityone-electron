<template>
  <div>
    <settings-menu />
    <v-main class="settings-page pl-0">
      <v-container 
        class="fill-height px-6"
        fluid
      >
        <v-card
          class="servers-card"
          height="100%"
          width="100%"
          flat
        >
          <v-card-title class="px-6 servers-card">
            Connected Organizations
          </v-card-title>
          <v-list
            class="servers-card"
            two-line
            subheader
          >
            <v-list-item
              v-for="(item, inx) in list"
              :key="inx"
              class="server-item"
            >
              <v-list-item-avatar>
                <v-img
                  :src="require('../assets/icon-server.png')"
                  height="40"
                  width="40"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-text="item.alias" />
                <v-list-item-subtitle v-text="item.url" />
              </v-list-item-content>
              <v-list-item-action>
                <v-btn 
                  outlined
                  color="error"
                  @click="disconnect(inx)"
                >
                  Disconnect
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-container>
    </v-main>
  </div>
</template>
<script>
import SettingsMenu from '@/components/SettingsMenu'
import { get } from 'vuex-pathify'

export default {
  name: 'Organizations',

  components: {
    SettingsMenu,
  }, 

  computed: {
    list: get('settings/servers'),
  },

  methods: {
    disconnect (index) {
      this.$store.dispatch('settings/removeServer', index)
    },
  },
}
</script>
<style lang="sass" scoped>
  .servers-card
    background-color: #eee
    .server-item
      background-color: white
      margin-bottom: 10px

  
</style>
  