<template>
  <div>
    <v-card
      height="100%"
      width="100%"
      flat
      class="settings-card"
    >
      <v-card-title v-text="title" />
      <v-card-text>
        <v-form
          ref="form"
        >
          <section
            v-for="(group, inx) in items"
            :key="inx"
            style="width: 100%"
          >
            <div v-text="group.title" />
            <article
              class="px-6 py-3 mt-2 mb-6"
              style="background-color: white"
            >
              <v-row
                v-for="item in group.items"
                :key="item.field"
                dense
                width="100%"
              >
                <v-col
                  cols="9"
                  style="padding-top: 6px"
                >
                  <label 
                    :for="item.field"
                    v-html="item.title"
                  />
                </v-col>
                <v-col
                  cols="3"
                >
                  <v-switch
                    v-if="item.field"
                    v-model="config[item.field]"
                    class="float-right mt-0"
                    hide-details
                    @change="change(item.field)"
                  />
                  <v-btn
                    v-if="item.button"
                    dark
                    tile
                    small
                    width="100"
                    color="rgb(160,210,65)"
                    class="float-right mt-0"
                    @click="method(item.method)"
                    v-text="item.button"
                  />
                </v-col>
              </v-row>
            </article>
          </section>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
  import { sync } from 'vuex-pathify'
  
  export default {
    name: 'GeneralSettings',

    data: () => ({
      title: 'General Settings',
      items: [
        { title: 'Appearance', items: [
          { title: 'Show app icon in system tray', field: 'trayIcon' },
          { title: 'Show sidebar (<span class="shortcut">Cmd Or Ctrl+S</span>)', field: 'showSidebar' },
          { title: 'Show app unread badge', field: 'badgeOption' },
        ]},
        { title: 'Desktop Notification', items: [
          { title: 'Show Desktop Notifications', field: 'showNotification' },
          { title: 'Mute all sounds from InfinityOne', field: 'silent' },
        ]},
        { title: 'App Updates', items: [
          { title: 'Get beta updates', field: 'betaUpdate' },
        ]},
        { title: 'Functionality', items: [
          { title: 'Start app at login', field: 'startAtLogin'},
          { title: 'Always start minimized', field: 'startminimized'},
          { title: 'Enable Spellchecker (requires restart', field: 'enableSpellchecker'},
        ]},
        // { title: 'Add custom CSS', items: [
        //   { title: 'This will inject the selected css stylesheet in all the added accounts', button: 'Add', method: 'add' },
        // ]},
        { title: 'Reset Application Data', items: [
          { title: 'This will delete all application data including all added accounts and preferencs', button: 'Reset', method: 'reset' },
        ]},
      ]
    }),

    computed: {
      trayIcon: {
        get () {
          return this.config().trayIcon
        },
        set (val) {
          this.config().trayIcon = val
        },
      },
      config: sync('settings/config'),
    },

    methods: {
      change (field) {
        this.$store.set(`settings/config@${field}`, this.config[field])
      },

      method (action) {
        switch (action) {
          case 'reset': 
            console.log('reset clicked')
            break
          case 'add': 
            console.log('add clicked')
            break
        }
      },
    },
  }
</script>
<style lang="sass" scoped>
    
</style>

