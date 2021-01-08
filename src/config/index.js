const mac = process.platform === 'darwin'
const cmdKey = mac ? '⌘' : 'Ctrl'
export default {
  defaultServerURL: 'https://meet.jit.si',
  defaultServerTimeout: 30,
  appName: 'InfinityOne',
  appId: 'com.emetrotel.infinityone-electron',
  toolTipColor: '#222',
  cmdKey,
  serverRetryTime1: 15000,
  serverRetryTime2: 30000,
  serverRetryTime3: 60000,
  serverRetryTime4: 300000,
  serverRetryThreshold1: 20,
  serverRetryThreshold2: 120,
  serverRetryThreshold3: 4 * 120
}