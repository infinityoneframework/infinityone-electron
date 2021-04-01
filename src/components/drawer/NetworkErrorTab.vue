<template>
  <v-list-item
    v-if="show"
    to="/network_error"
    :class="`nav-tab about ${activeClass}`"
    @mouseover="hover=true"
    @mouseleave="hover=false"
  >
    <v-list-item-icon>
      <v-icon>mdi-wifi-off</v-icon>
      <v-icon
        v-if="hover"
        style="position:absolute;top:0;right:0"
        color="error"
        size="20"
        @click.prevent="close"
      >
        mdi-close-circle
      </v-icon>
    </v-list-item-icon>
  </v-list-item>
</template>
<script>
  import { get, sync } from 'vuex-pathify'
  import DomainUtil from '@/utils/domain-util'

  const name = 'NetworkErrorTab'

  export default {
    name: name,

    data: () => ({
      hover: false,
    }),

    computed: {
      ...get('settings', ['currentComponent', 'lastServerId', 'networkErrors']),
      firstServer: get('settings/servers@[0]'),
      networkErrorTab: sync('settings/networkErrorTab'),
      tabActive () {
        return this.currentComponent && this.currentComponent.name === 'NetworkError'
      },
      activeClass () {
        return this.tabActive ? 'active' : ''
      },
      show () {
        return (this.tabActive || this.networkErrorTab)  && this.networkErrors !== {}
      },
    },

    watch: {
      currentComponent (curr, prev) {
        if (curr && curr.name === 'NetworkError' && prev && prev.name !== 'NetworkError') {
          this.networkErrorTab = true
        }
      },

      networkErrors (curr) {
        if (curr === {}) {
          this.networkErrorTab = false
        }
      },
    },

    methods: {
      close() {
        this.networkErrorTab = false
        this.hover = false
        DomainUtil.openDomain()
      }
    },
  }
</script>
