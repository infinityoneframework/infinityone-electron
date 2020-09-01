<template>
  <v-simple-table class="server-remote">
    <tbody>
      <tr>
        <th>{{ $t('URL') }}</th>
        <td>{{ item.url }}</td>
      </tr>
      <tr>
        <th>{{ $t('Icon') }}</th>
        <td>{{ item.icon }}</td>
      </tr>
      <tr>
        <th>{{ $t('Icon URL') }}</th>
        <td>{{ item.iconUrl }}</td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<script>
  const name = 'ServerRemote'
  export default {
    name: name,

    props: {
      item: {
        type: Object,
        required: true,
      },
      active: {
        type: Boolean,
        required: true,
      },
    },
    data: () => ({
      //
    }),
  }
</script>
<style lang="sass" scoped>
  //
</style>
