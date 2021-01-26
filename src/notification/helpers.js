const { remote } = require('electron')

// Do not change this
// const appId = 'com.emetrotel.infinityone-electron'
const appId = 'org.emetrotel.infinityone-electron'

const botsList = []
let botsListLoaded = false

function setNotificationCallback(callback) {
	const OldNotify = window.Notification
	const newNotify = (title, opt) => callback(title, opt)

  newNotify.requestPermission = OldNotify.requestPermission.bind(OldNotify)

	Object.defineProperty(newNotify, 'permission', {
		get: () => OldNotify.permission && newNotify.permission
	})

	window.Notification = newNotify
}

function setNotificationCallback2(NewNotification) {
	const OldNotify = window.Notification

	Object.defineProperty(NewNotification, 'permission', {
		get: () => OldNotify.permission && NewNotification._permission
	})
	window.Notification = NewNotification
}

// this function load list of bots from the server
// sync=True for a synchronous getJSON request
// in case botsList isn't already completely loaded when required in parseRely
function loadBots(sync = false) {
	const { $ } = window
	botsList.length = 0
	if (sync) {
		$.ajaxSetup({async: false})
	}
	$.getJSON('/json/users')
		.done(data => {
			const members = data.members
			members.forEach(membersRow => {
				if (membersRow.is_bot) {
					const bot = `@${membersRow.full_name}`
					const mention = `@**${bot.replace(/^@/, '')}**`
					botsList.push([bot, mention])
				}
			})
			botsListLoaded = true
		})
		.fail(error => {
			console.log('Request failed: ', error.responseText)
			console.log('Request status: ', error.statusText)
		})
	if (sync) {
		$.ajaxSetup({async: true})
	}
}

function checkElements(...elements) {
	let status = true
	elements.forEach(element => {
		if (element === null || element === undefined) {
			status = false
		}
	})
	return status
}

function customReply(reply) {
	// server does not support notification reply yet.
	const buttonSelector = '.messagebox #send_controls button[type=submit]'
	const messageboxSelector = '.selected_message .messagebox .messagebox-border .messagebox-content'
	const textarea = document.querySelector('#compose-textarea')
	const messagebox = document.querySelector(messageboxSelector)
	const sendButton = document.querySelector(buttonSelector)

	// sanity check for old server versions
	const elementsExists = checkElements(textarea, messagebox, sendButton)
	if (!elementsExists) {
		return
	}

	textarea.value = reply
	messagebox.click()
	sendButton.click()
}

const currentWindow = remote.getCurrentWindow()
const webContents = remote.getCurrentWebContents()
const webContentsId = webContents.id

// this function will focus the server that sent
// the notification. Main function implemented in main.js
function focusCurrentServer() {
	currentWindow.send('focus-webview-with-id', webContentsId)
}
// this function parses the reply from to notification
// making it easier to reply from notification eg
// @username in reply will be converted to @**username**
// #stream in reply will be converted to #**stream**
// bot mentions are not yet supported
function parseReply(reply) {
	const usersDiv = document.querySelectorAll('#user_presences li')
	const streamHolder = document.querySelectorAll('#stream_filters li')
	const users = []
	const streams = []

	usersDiv.forEach(userRow => {
		const anchor = userRow.querySelector('span a')
		if (anchor !== null) {
			const user = `@${anchor.textContent.trim()}`
			const mention = `@**${user.replace(/^@/, '')}**`
			users.push([user, mention])
		}
	})

	streamHolder.forEach(stream => {
		const streamAnchor = stream.querySelector('div a')
		if (streamAnchor !== null) {
			const streamName = `#${streamAnchor.textContent.trim()}`
			const streamMention = `#**${streamName.replace(/^#/, '')}**`
			streams.push([streamName, streamMention])
		}
	})

	users.forEach(([user, mention]) => {
		if (reply.includes(user)) {
			const regex = new RegExp(user, 'g')
			reply = reply.replace(regex, mention)
		}
	})

	streams.forEach(([stream, streamMention]) => {
		const regex = new RegExp(stream, 'g')
		reply = reply.replace(regex, streamMention)
	})

	// If botsList isn't completely loaded yet, make a synchronous getJSON request for list
	if (botsListLoaded === false) {
		loadBots(true)
	}

	// Iterate for every bot name and replace in reply
	// @botname with @**botname**
	botsList.forEach(([bot, mention]) => {
		if (reply.includes(bot)) {
			const regex = new RegExp(bot, 'g')
			reply = reply.replace(regex, mention)
		}
	})

	reply = reply.replace(/\\n/, '\n')
	return reply
}

function setupReply(id) {
	const { narrow } = window
	narrow.by_subject(id, { trigger: 'notification' })
}

function clickHandler() {

}
function replyHandler() {

}

function setHandlers(Notification, opts) {
	console.log(opts)
	Notification.addEventListener('click', clickHandler)
	Notification.addEventListener('reply', replyHandler)
}

module.exports = {
	appId,
	checkElements,
	customReply,
	parseReply,
	setupReply,
	focusCurrentServer,
	setHandlers,
	setNotificationCallback,
	setNotificationCallback2,
}
