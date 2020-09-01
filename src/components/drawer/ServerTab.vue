<template>
  <v-tooltip
    :key="inx"
    right
    :color="tipColor"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-list-item
        :key="inx"
        :to="`/server/${item.serverId}`"
        :class="`nav-tab ${serverTabActive}`"
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
            :src="icon(item.icon)"
            height="30"
            width="30"
          />
          <span :class="`server-tab-badge ${badgeCount > 0 ? 'active' : ''}`">
            {{ badgeCount }}
          </span>
          <span class="caption text-center mt-1">
            {{ `${userOSKey} ${inx + 1}` }}
          </span>
        </v-list-item-icon>
      </v-list-item>
    </template>
    <span v-text="item.alias + ' (' + item.url + ')'" />
  </v-tooltip>
</template>

<script>
  import { get } from 'vuex-pathify'
  import config from '@/config'

  const userOSKey = config.cmdKey
  const name = 'ServerTab'

  export default {
    name: name,

    props: {
      inx: {
        type: Number,
        required: true,
      },
      item: {
        type: Object,
        required: true,
      },
    },

    data: () => ({
      userOSKey: userOSKey,
      tipColor:  config.toolTipColor,
    }),

    computed: {
      ...get('settings', ['activeServerId', 'badgeCounts']),

      serverTabActive () {
        return this.activeServerId == this.item.serverId ? 'active' : ''
      },

      badgeCount () {
        return this.badgeCounts[this.item.serverId]
      }
    },

    methods: {
      contextMenu (index) {
        this.$emit('contextmenu', index)
      },

      icon (path) {
        // win 10 hack. v-icon seems to be stripping \ from the url.
        const src = path.replace(/\\/g, '/')
        if (src.startsWith('/') || /^[A-Z]:/.test(src)) {
          const url = `local-resource://${src}`
          return url
        }
        return src
      },
    },
  }
</script>

<style lang="sass" scoped>
  .nav-tab.v-list-item
    padding: 0 !important

  .server-tab-badge
    display: none
    &.active
      position: absolute
      top: 5px
      right: 5px
      line-height: 17px
      height: 17px
      // background: red
      background-color: #f44336
      color: white
      padding: 0 3px
      border-radius: 9px
      min-width: 17px
      text-align: center
      display: block
      font-size: 10px
      font-family: sans-serif
      font-weight: 500
</style>

