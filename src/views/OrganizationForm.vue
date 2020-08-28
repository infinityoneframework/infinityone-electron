<template>
  <v-main
    id="add-server-view"
    :class="`app-panel settings-page pl-0 ${show}`"
  >
    <v-container
      class="fill-height px-0 pl-0"
      style="padding-top: 100px"
      fluid
    >
      <v-card
        id="new-orginization"
        class="mx-auto"
        width="600"
      >
        <v-card-title>
          Add an InfinityOne server
        </v-card-title>
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
          >
            <span>
              <v-select
                v-model="scheme"
                :items="schemeList"
                style="width: 75px; display: inline-block"
                class="scheme-select"
                required
              />
              <v-text-field
                v-model="domain"
                :rules="urlRules"
                label="InfinityOne URL"
                required
                style="margin-left: 10px;width: calc(100% - 85px); display: inline-block"
                @keyup.enter="validate"
              />
            </span>
            <v-btn
              :disabled="!valid"
              color="success"
              class="mr-4"
              style="width: 100%"
              @click="validate"
            >
              {{ connect }}
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>
<script>
  import { get } from 'vuex-pathify'
  import DomainUtil from '@/utils/domain-util'

  const schemes = ['https://', 'http://']
  const name = 'OrganizationForm'

  export default {
    name: name,
    data: () => ({
      valid: true,
      domain: '',
      scheme: schemes[0],
      schemeList: schemes,
      urlRules: [
        v => !!v || 'InfinityOne URL is required',
        v => v.length > 2 || 'InfinityOne URL must be at least 3 characters long',
        v => /^(([a-z][a-z0-9\-_]+\.[a-z0-9\-_]+(\.[a-z0-9\-_]+)*)|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(:\d+)?$/i.test(v) || 'InfinityOne URL must be a IP address or a domain name!',
        v => !DomainUtil.duplicateDomain(v) || "Server already exists",
      ],
      connect: 'Connect',
    }),

    computed: {
      list: get('settings/servers'),
      currentComponent: get('settings/currentComponent'),
      url () { return this.scheme + this.domain },
      show () {
        return this.currentComponent && this.currentComponent.name === name ? '' : 'inactive'
      },
    },

    methods: {
      validate () {
        this.connect = 'Connecting...'
        DomainUtil.checkDomain(this.url).then(serverConf => {
          DomainUtil.addDomain(serverConf).then(() => {
            const timeout = () => {
              const servers = this.list
              const newServer = servers[servers.length - 1]
              this.resetForm()
              this.$router.push({ path: `/server/${newServer.serverId}` })
            }
            setTimeout(timeout, 1)
          });
        }, errorMessage => {
          this.connect = 'Connect';
          alert(errorMessage)
        });
      },

      resetForm () {
        this.domain = ''
        this.scheme = schemes[0]
        this.connect = 'Connect'
        this.valid = true
      }
    }
  }
</script>
<style lang="sass">
  #new-orginization
    padding-left: 50px
    padding-right: 50px
    padding-bottom: 50px
  .scheme-select
    .v-select__selection--comma
      margin: 7px 0 !important
      overflow: visible !important

</style>
