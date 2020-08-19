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
      <v-list
        class="servers-nav-block"
        dense
      >
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
                :class="`nav-tab ${serverTabActive(item.serverId)}`"
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

        <v-list-item
          v-if="showAbout"
          to="/about"
          :class="`nav-tab about ${tabActive('About')}`"
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

        <v-tooltip
          right
          :color="tipColor"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-list-item
              to="/organization/new"
              :class="`nav-tab ${tabActive('add-server')}`"
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
        class="bottom-nav-block"
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
                :class="`nav-tab ${item.name || ''} ${tabActive(item.name)}`"
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

  const mac = process.platform === 'darwin'
  const userOSKey = mac ? '⌘' : 'Ctrl'

  export default {
    name: 'Drawer',

    data: () => ({
      items: [
        { icon: 'mdi-reload', title: 'Reload', to: '', id: 'reload' },
        { icon: 'mdi-arrow-left', title: 'Go Back', to: '', id: 'back' },
        { icon: 'mdi-settings', title: 'Settings', to: '/settings', name: 'settings' },
      ],
      topItems: [
        { icon: 'mdi-plus', title: 'Add Organization', to: '/servers/new', name: 'new-server' },
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
      aboutHover: false,
    }),

    computed: {
      ...get('settings', ['servers', 'currentComponent', 'activeServerId', 'lastServerId']),
      aboutOpen: sync('settings/aboutOpen'),
      showSidebar: sync('settings/config@showSidebar'),
      serverTabActive () {
        return serverId => this.currentComponent && this.currentComponent.name === 'ServerWebView' && serverId === this.activeServerId ? 'active' : ''
      },
      tabActive () {
        return name => {
          switch (name) {
            case 'add-server':
              return this.currentComponent && this.currentComponent.name === 'OrganizationForm' ? 'active' : ''
            case 'settings':
              return this.currentComponent && this.currentComponent.name === 'Settings' ? 'active' : ''
            case 'About':
              console.log('comp', this.currentComponent.name)
              return this.currentComponent && this.currentComponent.name === 'About' ? 'active' : ''
          }
          return ''
        }
      },
      showAbout () {
        return (this.currentComponent && this.currentComponent.name === 'About') || this.aboutOpen
      },
    },


    beforeUpdate () {
      if (this.currentComponent && this.currentComponent.name == 'About') {
        this.aboutOpen = true
      }
    },
    methods: {
      click (id) {
        const el = document.querySelector('webview.enabled')
        if (el) {
          if (id === 'reload') {
            el.reload()
          } else if (id === 'back') {
            el.canGoBack() && el.goBack()
          }
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
            break
        }
      },

      closeAbout () {
        const serverId = this.lastServerId || this.servers[0].serverId
        this.aboutOpen = false
        this.aboutHover = false
        this.$router.push({ path: `/server/${serverId}`})
      }
    },
  }
</script>
<style lang="sass" scoped>
  .nav-tab
    padding-top: 5px
    padding-bottom: 5px
    &.settings
      // padding-top: 5px
      // padding-bottom: 5px
      &.active
        background-color: #ddd
        i.v-icon
          color: black
    &.active
      background-color: #666
  .bottom-nav-block
    padding-bottom: 0 !important
  .servers-nav-block, .bottom-nav-block
    width: 60px
</style>
