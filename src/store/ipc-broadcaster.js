import { ipcRenderer } from 'electron'
import process from 'process'

const debug = false
const ignoreTypes = ['settings/SET_CURRENT_COMPONENT']

const send = theMutation => {
  const mutation = { ...theMutation }
  try {
    if (process.type === 'renderer') {
      if (!ignoreTypes.includes(mutation.type)) {
        ipcRenderer.send('vuex-mutation', mutation)
        if (debug) { console.log('send mutation success', mutation) }
      } else {
        if (debug) { console.log('send mutation ignore', mutation) }
      }
    }
  }
  catch(err) {
    console.warn('faild on type', mutation.type)
    // this will fail on certain types
    // do nothing
  }
}

const plugin = store => {
  store.subscribe((mutation) => {
    send(mutation)
  })
}

export default {
  plugin,
}