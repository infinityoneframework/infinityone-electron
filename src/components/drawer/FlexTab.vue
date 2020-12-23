<template>
  <v-tooltip
    right
    :color="tipColor"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-list-item
        :class="`nav-tab ${item.name || ''} ${tabActive(item.name)}`"
        link
        v-bind="attrs"
        @click="click(item)"
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
<script>
  import { get } from 'vuex-pathify'
  import config from '@/config'
  import DomainUtil from '@/utils/domain-util'

  const name = 'FlexTab'
  export default {
    name: name,

    props: {
      item: {
        type: Object,
        required: true,
      },
    },

    data: () => ({
      tipColor:  config.toolTipColor,
    }),

    computed: {
      ...get('settings', ['currentComponent', 'lastServerId']),
      firstServer: get('settings/servers@[0]'),
      tabActive () {
        return name => {
          switch (name) {
            case 'add-server':
              return this.currentComponent &&
                this.currentComponent.name === 'OrganizationForm' ? 'active' : ''
            case 'settings':
              return this.currentComponent &&
                this.currentComponent.name === 'Settings' ? 'active' : ''
          }
          return ''
        }
      },
    },

    methods: {
      click (item) {
        const el = document.querySelector('webview.enabled')
        if (item.id === 'reload') {
          if (el) {
            el.reload()
          }
        } else if (item.id === 'back') {
          if (el) {
            el.canGoBack() && el.goBack()
          } else {
            DomainUtil.openDomain()
          }
        } else if (item.to) {
          this.$router.push({ path: item.to })
        }
      },
    },
  }
</script>
<style lang="sass" scoped>
  //
</style>

