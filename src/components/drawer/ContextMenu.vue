<template>
  <v-menu
    v-model="show"
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
</template>
<script>
  import { get } from 'vuex-pathify'

  const name = 'ContextMenu'
  export default {
    name: name,

    props: {
      index: {
        type: Number,
        default: 0,
      },
      value: {
        type: Boolean,
        required: true,
      },
    },

    data: () => ({
      menuItems: [
        { id: 'openDevTools', title: 'Open Dev Tools' },
        { id: 'reload', title: 'Reload' },
      ],
    }),

    computed: {
      ...get('settings', ['servers', 'currentComponent', 'activeServerId', 'lastServerId']),
      show: {
        get () {
          return this.value
        },
        set (val) {
          this.$emit('value', val)
        }
      },
    },

    methods: {
      menuClick(id) {
        const el = document.querySelector(`.server-view[data-tab-id="${this.index}"]`)
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

