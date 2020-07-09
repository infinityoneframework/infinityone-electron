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
    name: 'NetworkSettings',
    data: () => ({
      title: 'Network Settings',
    }),
  }
</script>
<style lang="sass" scoped>
  //
</style>

