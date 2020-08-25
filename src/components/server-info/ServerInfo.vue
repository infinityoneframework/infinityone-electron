<template>
  <span>
    <v-dialog
      v-model="dialog"
      width="800"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          text
          v-bind="attrs"
          v-on="on"
        >
          Show
        </v-btn>
      </template>

      <v-card id="server-info-dialog">
        <v-card-title class="headline grey darken-3 white--text">
          Server Info
        </v-card-title>

        <v-card-text>
          <v-progress-circular
            v-if="verifying"
            :size="70"
            :width="7"
            color="green"
            style="position: absolute; top: 200px; left: calc(50% - 35px)"
            indeterminate
          />
          <div
            :class="`card-body ${verifying ? 'verifying' : ''}`"
          >
            <div class="d-flex justify-space-between">
              <v-simple-table>
                <tbody>
                  <tr>
                    <th width="80">URL</th>
                    <td>
                      {{ server.url }}
                    </td>
                  </tr>
                  <tr>
                    <th>Icon</th>
                    <td>{{ server.icon }}</td>
                  </tr>
                  <tr>
                    <th>Alias</th>
                    <td>{{ server.alias }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
              <v-avatar
                class="ma-3"
                size="125"
                tile
              >
                <v-img :src="icon(server.icon)" />
              </v-avatar>
            </div>
            <hr class="mt-2">
            <v-simple-table>
              <tbody>
                <tr>
                  <th width="80">Primary</th>
                  <td>
                    <server-remote
                      :item="server.remote"
                      :active="server.url === server.remote.url"
                    />
                  </td>
                </tr>
                <tr>
                  <th>Local</th>
                  <td>
                    <server-remote
                      :item="server.local"
                      :active="server.url === server.remote.url"
                    />
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
            <v-overlay :value="verifying">
              <v-btn
                icon
                color="error"
                large
                @click="verifying = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-overlay>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-btn
            color="primary"
            text
            @click="verify"
          >
            Verify
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="dialog=false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>
<script>
  import ServerRemote from './ServerRemote'
  import DomainUtil from '@/utils/domain-util'

  const name = 'ServerInfo'

  export default {
    name: name,

    components: {
      ServerRemote,
    },
    props: {
      server: {
        type: Object,
        required: true,
      },
    },

    data: () => ({
      dialog: false,
      verifying: false
    }),

    methods: {
      icon (src) {
        if (src.startsWith('/')) {
          return `local-resource://${src}`
        }
        return src
      },

      verify () {
        this.verifying = true
        const opts = { showCloseIcn: true, target: '#server-info-dialog', timer: 5 }
        setTimeout(() => {
          DomainUtil.verifyServer(this.server)
            .then(() => {
              this.verifying = false
              this.$notification.success('Server verified successfully', opts)
            })
            .catch(error => {
              console.warn('error', error)
              this.verifying = false
              this.$notification.error('Problem verifing servers!', { ...opts, timer: 8 })
            })
        }, 1)
      },
    },
  }
</script>
<style lang="sass" scoped>
  //
</style>

