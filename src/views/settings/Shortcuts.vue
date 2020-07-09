<template>
  <div>
    <v-card
      height="100%"
      width="100%"
      flat
      class="settings-card"
    >
      <v-card-title v-text="title" />
      <v-card-text>
        <!--  -->
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
  export default {
    name: 'ShortcutSettings',
    data: () => ({
      title: 'Shortcuts',
    }),
  }
</script>
<style lang="sass" scoped>
  //
</style>

