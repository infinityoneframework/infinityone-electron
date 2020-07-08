<template>
  <v-main class="pl-0">
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
        <v-card-body>
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-text-field
              v-model="url"
              :rules="urlRules"
              label="InfinityOne URL"
              required
            />
            <v-btn
              :disabled="!valid"
              color="success"
              class="mr-4"
              style="width: 100%"
              @click="validate"
            >
              Connect
            </v-btn>
          </v-form>
        </v-card-body>
      </v-card>
    </v-container>
  </v-main>
</template>
<script>
import { sync } from 'vuex-pathify'

export default {
  name: 'OrganizationForm',
  data: () => ({
    valid: true,
    url: '',
    urlRules: [
      v => !!v || 'InfinityOne URL is required',
      v => /https?:\/\/[a-zA-Z0-9\-_]+\..*/.test(v) || 'Name must be less than 10 characters',
    ],
  }),

  computed: {
    list: sync('organizations/list'),
  },

  methods: {
    validate () {
      // this.$refs.form.validate()
      this.list.push({ url: this.url })
    },
  }
}
</script>
<style lang="sass" scoped>
  #new-orginization
    padding-left: 50px
    padding-right: 50px
    padding-bottom: 50px
</style>
