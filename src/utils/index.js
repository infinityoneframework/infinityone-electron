import fs from 'fs'
import i18n from '@/i18n'

const $t = msg => i18n.tc(msg)

const deleteProp = (object, prop) => Object.keys(object).reduce((obj, key) => {
  console.log('object type', typeof object, typeof obj)
  if (key !== prop) {
    obj[key] = object[key]
  }
  return obj
}, {})

const range = (start, end) => { return (new Array(end - start + 1)).fill(null).map((_, i) => i + start) }

const errorBoxes = {
  domain: (dialog) => {
    dialog.showErrorBox(
      $t('Error saving new server'),
      $t('There seems to be error while saving new server, ' +
      'you may have to re-add your previous servers back.')
    )
  },
  settings: (dialog) => {
    dialog.showErrorBox(
      $t('Error saving settings'),
      $t('We encountered error while saving current settings.')
    )
  }
}
const verifyUserData = (path, which, dialog) => {
  try {
    const file = fs.readFileSync(path, 'utf8')
    return JSON.parse(file)
  } catch (err) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
      errorBoxes[which](dialog)
      console.error(`Error while JSON parsing ${which}.json: `, err)
    }
    return false
  }
}

const defaultSettings = {
	trayIcon: true,
	silent: false,
	startMinimized: false,
	useProxy: false,
	betaUpdate: false,
	showSidebar: true,
	customCSS: null,
	badgeOption: true,
	startAtLogin: false,
	enableSpellchecker: true,
	showNotification: true,
	lastActiveTab: 0,
	spellcheckerLanguage: 'en',
  flashTaskbarOnMessage: false,
	proxyPAC: '',
	proxyRules: '',
  proxyBypass: '',
}

export default {
  deleteProp,
  range,
  verifyUserData,
  defaultSettings,
}