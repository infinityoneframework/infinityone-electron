<template>
  <v-btn
    icon
    class="back-button"
    @click="click"
  >
    <v-icon>mdi-arrow-left</v-icon>
  </v-btn>
</template>
<script>
  import DomainUtil from '@/utils/domain-util'

  const name = 'BackButton'
  export default {
    name: name,

    methods: {
      click () {
        DomainUtil.openDomain()
      },
    },
  }
</script>
<style lang="sass" scoped>
  .v-btn.back-button
    margin-left: -10p
    margin-right: 5px
</style>
