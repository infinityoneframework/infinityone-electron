<template>
  <v-main class="pl-0">
    <v-container 
      class="fill-height px-0 pl-0"
      fluid
    >
      <settings-menu />
      <v-card
        height="100%"
        width="80%"
      >
        <v-list>
          <v-list-item
            v-for="(item, inx) in list"
            :key="inx"
          >
            <v-list-item-avatar>
              <v-img
                :src="require('../assets/icon-server.png')"
                height="40"
                width="40"
              />
            </v-list-item-avatar>
            <v-list-item-content v-text="item.url" />
            <v-list-item-action>
              <v-btn outlined>
                Disconnect
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card>
    </v-container>
  </v-main>
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
    list: get('organizations/list'),
  },
}
</script>
<style lang="sass" scoped>
  //
</style>
  