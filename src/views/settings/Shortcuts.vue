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

    data: () => ({
      title: 'Shortcuts',

      items: [
        { title: 'Application Shortcuts', items: [
          { title: 'Settings', keys: [userOSKey, ','] },
          { title: 'Keyboard Shortcuts', keys: [userOSKey, 'K'] },
          { title: 'Reset App Settings', keys: ['Shift', userOSKey, 'D'], os: 'mac' },
          { title: 'Log Out', keys: [userOSKey, 'L'] },
          { title: 'Hide InfinityOne', keys: [userOSKey, 'H'], os: 'mac' },
          { title: 'Hide Others', keys: ['Option', userOSKey, 'H'], os: 'mac' },
          { title: 'Quit InfinityOne', keys: [userOSKey, 'Q'] },
        ]},
        { title: 'Edit Shortcuts', items: [
          { title: 'Undo', keys: [userOSKey, 'Z'] },
          { title: 'Redo', keys: ['Shift', userOSKey, 'Z'], os: 'mac' },
          { title: 'Redo', keys: [userOSKey, 'Y'], os: 'win' },
          { title: 'Cut', keys: [userOSKey, 'X'] },
          { title: 'Copy', keys: [userOSKey, 'C'] },
          { title: 'Paste', keys: [userOSKey, 'V'] },
          { title: 'Paste and Match Style', keys: ['Shift', userOSKey, 'V'] },
          { title: 'Select All', keys: [userOSKey, 'A'] },
          { title: 'Find', keys: [userOSKey, 'F'], os: 'mac' },
          { title: 'Find Next', keys: [userOSKey, 'G'], os: 'mac' },
          { title: 'Emoji & Symbols', keys: ['Control', userOSKey, 'Space'], os: 'mac' },
        ]},
        { title: 'View Shortcuts', items: [
          { title: 'Reload', keys: [userOSKey, 'R'] },
          { title: 'Hard Reload', keys: ['Shift', userOSKey, 'R'] },
          { title: 'Enter Full Screen', keys: ['Control', userOSKey, mac ? 'F' : 'F11'] },
          { title: 'Zoom In', keys: [userOSKey, mac ? '+' : '='] },
          { title: 'Zoom Out', keys: [userOSKey, '-'] },
          { title: 'Actual Size', keys: [userOSKey, '0'] },
          { title: 'Toggle Sidebar', keys: [userOSKey, 'S'] },
          { title: 'Toggle DevTools for InfinityOne App', keys: [mac ? 'Option' : 'Shift', userOSKey, 'I'] },
          { title: 'Toggle DevTools for Active Tab', keys: [mac ? 'Option' : 'Shift', userOSKey, 'U'] },
        ] },
        { title: 'History Shortcuts', items: [
          { title: 'Back', keys: [userOSKey, '←'] },
          { title: 'Forward', keys: [userOSKey, '→'] },
        ]},
        { title: 'Window Shortcuts', items: [
          { title: 'Minimize', keys: [userOSKey, 'M'] },
          { title: 'Close', keys: [userOSKey, mac ? 'C' : 'W'] },
        ]},
      ],
      mac: mac,
    }),

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

