<template>
  <v-navigation-drawer
    v-model="showSidebar"
    mini-variant
    mini-variant-width="60"
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
        <template 
          v-for="(item, inx) in servers"
        >
          <v-tooltip 
            :key="inx"
            right
            :color="tipColor"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-list-item
                :key="inx"
                :to="`/server/${item.serverId}`"
                link
                v-bind="attrs"
                v-on="on"
                @contextmenu.prevent="contextMenu(inx)"
              >
                <v-list-item-icon 
                  class="d-flex flex-column"
                  style="height: 50px"
                >
                  <v-img
                    :src="require('@/assets/icon-server.png')"
                    height="30"
                    width="30"
                  />
                  <span class="caption text-center mt-1">
                    {{ `${userOSKey} ${inx + 1}` }}
                  </span>
                </v-list-item-icon>
              </v-list-item>
            </template>
            <span v-text="item.alias" />
          </v-tooltip>
        </template>
        <v-tooltip 
          right
          :color="tipColor"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-list-item
              to="/organization/new"
              v-bind="attrs"
              v-on="on"
            >
              <v-list-item-icon>
                <v-icon>mdi-plus</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </template>
          <span>Add Organization</span>
        </v-tooltip>
      </v-list>
      <v-list 
        justify-end
        dense
      >
        <template
          v-for="item in items"
        >
          <v-tooltip
            :key="item.title"
            right
            :color="tipColor"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-list-item
                :key="item.title"
                :to="item.to"
                link
                v-bind="attrs"
                @click="click(item.id)"
                v-on="on"
              >
                <v-list-item-icon>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </template>
            <span v-text="item.title" />
          </v-tooltip>
        </template>
      </v-list>
    </v-layout>
    <v-menu 
      v-model="menu"
      top
    >
      <v-list dense>
        <v-list-item
          v-for="item in menuItems"
          :key="item.id"
          @click="menuClick(item.id)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-navigation-drawer>
</template>
<script>
  import { get, sync } from "vuex-pathify"
  import SystemUtil from '@/utils/system-util'

  const mac = process.platform === 'darwin'
  const userOSKey = mac ? '⌘' : 'Ctrl'

  export default {
    name: 'Drawer',

    data: () => ({
      items: [
        { icon: 'mdi-reload', title: 'Reload', to: '', id: 'reload' },
        { icon: 'mdi-arrow-left', title: 'Go Back', to: '', id: 'back' },
        { icon: 'mdi-settings', title: 'Settings', to: '/settings' },
      ],
      userOSKey: userOSKey,
      tipColor: '#222',
      menu: false,
      menuItems: [
        { id: 'openDevTools', title: 'Open Dev Tools' },
        { id: 'reload', title: 'Reload' },
      ],
      selectedServer: null,
      selectServerIndex: null,
    }),

    computed: {
      servers: get('settings/servers'),
      showSidebar: sync('settings/config@showSidebar'),
    },

    methods: {
      click (to) {
        console.log('chicked', to)
        if (to === 'reload') {
          SystemUtil.reload()
        }
      },

      contextMenu (index) {
        this.selectedServer = this.servers[index]
        this.selectedServer.index = index
        console.log('context menu for ', index, this.selectedServer.alias)
        this.selectedServerIndex = index
        this.menu = true
      },

      menuClick(id) {
        console.log('menuclick', id, this.selectedServer)
        const el = document.querySelector(`.server-view[data-tab-id="${this.selectedServerIndex}"]`)
        console.log('el', el)
        switch (id) {
          case 'openDevTools':
            el.openDevTools()
            break
          case 'reload':
            el.reload()
            break
        }
      },
    },
  }
</script>
<style lang="sass" scoped>
  //
</style>
