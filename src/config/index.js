const mac = process.platform === 'darwin'
const cmdKey = mac ? '⌘' : 'Ctrl'
export default {
  defaultServerURL: 'https://meet.jit.si',
  defaultServerTimeout: 30,
  appName: 'InfinityOne',
  toolTipColor: '#222',
  cmdKey,
}