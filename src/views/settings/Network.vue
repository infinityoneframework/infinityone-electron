<template>
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
            :class="visible(item.field || item.type) ? '' : 'hidden'"
            dense
            width="100%"
          >
            <v-col
              v-if="item.title"
              cols="8"
              style="padding-top: 6px"
            >
              <label
                :for="item.field"
                v-text="item.title"
              />
            </v-col>
            <v-col
              cols="4"
            >
              <v-switch
                v-if="item.type === 'switch'"
                v-model="fields[item.field]"
                class="float-right mt-0"
                hide-details
                @change="change(item.field)"
              />
              <v-text-field
                v-if="item.type === 'text'"
                v-model="fields[item.field]"
                class="mt-0"
                hide-details
                :placeholder="item.placeHolder"
                @change="change(item.field)"
              />
              <v-btn
                v-if="item.button"
                dark
                :disabled="!showSave"
                tile
                small
                width="100"
                color="rgb(160,210,65)"
                class="mt-0"
                @click="method(item.method)"
                v-text="item.button"
              />
              <span
                v-if="item.items"
              >
                <v-btn
                  v-for="btn in item.items"
                  :key="btn.method"
                  dark
                  :disabled="!showSave"
                  tile
                  small
                  width="100"
                  :class="`mt-0 mr-2 ${btn.method}`"
                  @click="method(btn.method)"
                  v-text="btn.button"
                />
              </span>
            </v-col>
          </v-row>
        </article>
      </section>
    </v-form>
  </v-card-text>
</template>
<script>
  import { sync } from 'vuex-pathify'
  import configUtil from '@/utils/config-util'

  const debug = false

  export default {
    name: 'NetworkSettings',
    data () {
      return {
        title: this.$t('Network Settings'),

        showSave: false,

        fields: {
          useProxy: false,
          proxyPAC: '',
          proxyRules: '',
          proxyBypass: '',
        },

        items: [
          { title: this.$t('Proxy'), items: [
            { title: this.$t('Connect servers through a proxy'), field: 'useProxy', type: 'switch' },
            { title: this.$t('PAC script'), field: 'proxyPAC', placeHolder: 'foobar.com/pacfile.js', type: 'text' },
            { title: this.$t('Proxy rules'), field: 'proxyRules', placeHolder: 'http=foopy:80;ftp=foopy2', type: 'text' },
            { title: this.$t('Proxy bypass rules'), field: 'proxyBypass', placeHolder: 'foobar.com', type: 'text' },
            { type: 'buttons', items: [
              { button: this.$t('Save'), method: 'submit' },
              { button: this.$t('Cancel'), method: 'cancel' },
            ]},
          ]},
        ],
      }
    },

    computed: {
      config: sync('settings/config'),
      visible () {
        return field => field === 'useProxy' || field === 'buttons' ? true : this.fields.useProxy
      }
    },

    mounted () {
      this.init()
    },

    methods: {
      change (field) {
        if (debug) { console.log('change', field) }
        if (field === 'useProxy') {
          this.showFields = this.fields.useProxy
        }
        this.showSave = true
      },

      method (type) {
        if (type === 'submit' ) {
          if (debug) { console.log('submitting form', this.fields) }
          configUtil.saveConfigItems(this.fields)
          this.showSave = false
        } else if (type === 'cancel') {
          this.init()
          this.showSave = false
        }
      },

      init () {
        this.fields.useProxy = this.config.useProxy
        this.fields.proxyPAC = this.config.proxyPAC
        this.fields.proxyRules = this.config.proxyRules
        this.fields.proxyBypass = this.config.proxyBypass
      },
    },
  }
</script>
<style lang="sass" scoped>
  .row.hidden
    display: none
  button.submit
    background-color: rgb(160,210,65) !important
    color: #666 !important
  button.submit[disabled="disabled"]
    background-color: rgb(160,210,65) !important
    color: #999 !important
  button.cancel
    background-color: #999 !important
  button.cancel[disabled="disabled"]
    background-color: #999 !important
  button[disabled="disabled"]
    opacity: 0.8 !important
</style>

