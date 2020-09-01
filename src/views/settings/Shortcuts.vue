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
              v-for="(item, index) in groupItems(group)"
              :key="index"
              dense
              width="100%"
            >
              <v-col
                v-if="mac"
                cols="6"
                class="text-right"
              >
                <kbd
                  v-for="key in item.keys"
                  :key="key"
                  v-text="key"
                />
              </v-col>
              <v-col
                v-else
                cols="6"
                class="text-right"
              >
                <kbd
                  :key="item.keys[0]"
                  v-text="item.keys[0]"
                />
                +
                <kbd
                  :key="item.keys[1]"
                  v-text="item.keys[1]"
                />
                <span v-if="item.keys.length === 3">
                  +
                  <kbd
                    :key="item.keys[2]"
                    v-text="item.keys[2]"
                  />
                </span>
              </v-col>
              <v-col
                cols="6"
                class="my-auto body-1"
                v-text="item.title"
              />
            </v-row>
          </article>
        </section>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
  // const mac = false
  const mac = process.platform === 'darwin'
  const userOSKey = mac ? '⌘' : 'Ctrl'

  export default {
    name: 'ShortcutSettings',

    components: {
      // Kbd: () => import('@/components/Kbd'),
    },

    data () {
      return {
        title: this.$t('Shortcuts'),

        items: [
          { title: this.$t('Application Shortcuts'), items: [
            { title: this.$t('Settings'), keys: [userOSKey, ','] },
            { title: this.$t('Keyboard Shortcuts'), keys: [userOSKey, 'K'] },
            { title: this.$t('Reset App Settings'), keys: [this.$t('Shift'), userOSKey, 'D'], os: 'mac' },
            { title: this.$t('Log Out'), keys: [userOSKey, 'L'] },
            { title: this.$t('Hide InfinityOne'), keys: [userOSKey, 'H'], os: 'mac' },
            { title: this.$t('Hide Others'), keys: [this.$t('Option'), userOSKey, 'H'], os: 'mac' },
            { title: this.$t('Quit InfinityOne'), keys: [userOSKey, 'Q'] },
          ]},
          { title: this.$t('Edit Shortcuts'), items: [
            { title: this.$t('Undo'), keys: [userOSKey, 'Z'] },
            { title: this.$t('Redo'), keys: [this.$t('Shift'), userOSKey, 'Z'], os: 'mac' },
            { title: this.$t('Redo'), keys: [userOSKey, 'Y'], os: 'win' },
            { title: this.$t('Cut'), keys: [userOSKey, 'X'] },
            { title: this.$t('Copy'), keys: [userOSKey, 'C'] },
            { title: this.$t('Paste'), keys: [userOSKey, 'V'] },
            { title: this.$t('Paste and Match Style'), keys: [this.$t('Shift'), userOSKey, 'V'] },
            { title: this.$t('Select All'), keys: [userOSKey, 'A'] },
            { title: this.$t('Find'), keys: [userOSKey, 'F'], os: 'mac' },
            { title: this.$t('Find Next'), keys: [userOSKey, 'G'], os: 'mac' },
            { title: this.$t('Emoji & Symbols'), keys: [this.$t('Control'), userOSKey, this.$t('Space')], os: 'mac' },
          ]},
          { title: this.$t('View Shortcuts'), items: [
            { title: this.$t('Reload'), keys: [userOSKey, 'R'] },
            { title: this.$t('Hard Reload'), keys: [this.$t('Shift'), userOSKey, 'R'] },
            { title: this.$t('Enter Full Screen'), keys: [this.$t('Control'), userOSKey, mac ? 'F' : 'F11'] },
            { title: this.$t('Zoom In'), keys: [userOSKey, mac ? '+' : '='] },
            { title: this.$t('Zoom Out'), keys: [userOSKey, '-'] },
            { title: this.$t('Actual Size'), keys: [userOSKey, '0'] },
            { title: this.$t('Toggle Sidebar'), keys: [userOSKey, 'S'] },
            { title: this.$t('Toggle DevTools for InfinityOne App'), keys: [mac ? this.$t('Option') : this.$t('Shift'), userOSKey, 'I'] },
            { title: this.$t('Toggle DevTools for Active Tab'), keys: [mac ? this.$t('Option') : this.$t('Shift'), userOSKey, 'U'] },
          ] },
          { title: this.$t('History Shortcuts'), items: [
            { title: this.$t('Back'), keys: [userOSKey, '←'] },
            { title: this.$t('Forward'), keys: [userOSKey, '→'] },
          ]},
          { title: this.$t('Window Shortcuts'), items: [
            { title: this.$t('Minimize'), keys: [userOSKey, 'M'] },
            { title: this.$t('Close'), keys: [userOSKey, mac ? 'C' : 'W'] },
          ]},
        ],
        mac: mac,
      }
    },

    computed: {
    },

    methods: {
      groupItems (group) {
        const os = mac ? 'mac' : 'win'
        const reverseWin = keys => {
          if (keys.length == 2) {
            return keys
          }
          return [keys[1], keys[0], keys[2]]
        }
        return group.items.filter((item) => !item.os || item.os === os).map((item) => mac ? item :  { ...item, keys: reverseWin(item.keys )})
      },
    }
  }
</script>
<style lang="sass" scoped>
  //
</style>

