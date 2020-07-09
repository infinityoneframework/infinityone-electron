console.log('this is preload')
window.isMe = true
document.addEventListener('DOMContentLoaded', () => {
  window.isElectron = true
})