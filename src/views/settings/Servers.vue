<template>
  <v-card-text>
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
            :src="require('@/assets/icon-server.png')"
            height="40"
            width="40"
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ item.alias }}
            <span
              v-if="item.serverVersion"
              class="version"
              v-text="'v' + item.serverVersion"
            />
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ item.url }}
            <span
              v-if="item.local && item.local.url"
              class="local-url"
            >
              ({{ $t('Local LAN') }}: {{ item.local.url }})
            </span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-row>
            <v-col>
              <server-info :server="item" />
            </v-col>
            <v-col>
              <v-btn
                outlined
                color="error"
                @click="disconnect(inx)"
              >
                {{ $t('Disconnect') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card-text>
</template>
<script>
  import { get } from 'vuex-pathify'
  import ServerInfo from '@/components/server-info'

  export default {
    name: 'ServersSettings',

    components: {
      ServerInfo,
    },

    computed: {
      list: get('settings/servers'),
    },

    methods: {
      async disconnect (index) {
        const res = await this.$confirm(`${this.$t('Remove')} <b>${this.list[index].url}</b>?`, { title: this.$t('Are you sure?') })
        if (res) {
          this.$store.dispatch('settings/removeServer', index)
        }
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
      .version
        margin-left: 10px
        font-size: smaller
        font-style: italic
      .local-url
        margin-left: 10px
        font-style: italic
</style>
