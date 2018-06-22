'use strict';

const path = require('path');
const fs = require('fs');

const DomainUtil = require(__dirname + '/../utils/domain-util.js');
const ConfigUtil = require(__dirname + '/../utils/config-util.js');
const SystemUtil = require(__dirname + '/../utils/system-util.js');
const LinkUtil = require(__dirname + '/../utils/link-util.js');
const { shell, app, dialog } = require('electron').remote;

const BaseComponent = require(__dirname + '/../components/base.js');

const shouldSilentWebview = ConfigUtil.getConfigItem('silent');
class WebView extends BaseComponent {
	constructor(props) {
		super();

		this.props = props;

		this.zoomFactor = 1.0;
		this.loading = false;
		this.badgeCount = 0;
		this.customCSS = ConfigUtil.getConfigItem('customCSS');
	}

	template() {
		return `<webview
					class="disabled"
					data-tab-id="${this.props.tabIndex}"
					src="${this.props.url}"
					${this.props.nodeIntegration ? 'nodeIntegration' : ''}
					disablewebsecurity
					${this.props.preload ? 'preload="js/preload.js"' : ''}
					partition="persist:webviewsession"
					webpreferences="allowRunningInsecureContent, javascript=yes">
				</webview>`;
	}

	init() {
		this.$el = this.generateNodeFromTemplate(this.template());
		this.props.$root.appendChild(this.$el);

		this.registerListeners();
	}

	registerListeners() {
		this.$el.addEventListener('new-window', event => {
			const { url } = event;
			const domainPrefix = DomainUtil.getDomain(this.props.index).url;

			try {
				if (LinkUtil.isInternal(domainPrefix, url) || url === (domainPrefix + '/')) {
					event.preventDefault();
					this.$el.loadURL(url);
				} else {
					event.preventDefault();
					shell.openExternal(url);
				}
			} catch (err) {
				console.warn('error registering listeners');
			}
		});

		if (shouldSilentWebview) {
			this.$el.addEventListener('dom-ready', () => {
				this.$el.setAudioMuted(true);
			});
		}

		this.$el.addEventListener('page-title-updated', event => {
			const { title } = event;
			this.badgeCount = this.getBadgeCount(title);
			this.props.onTitleChange();
		});

		this.$el.addEventListener('did-navigate-in-page', event => {
			const isSettingPage = event.url.includes('renderer/preference.html');
			if (isSettingPage) {
				return;
			}
			this.canGoBackButton();
		});

		this.$el.addEventListener('did-navigate', () => {
			this.canGoBackButton();
		});

		this.$el.addEventListener('page-favicon-updated', event => {
			const { favicons } = event;
			// This returns a string of favicons URL. If there is a PM counts in unread messages then the URL would be like
			if (favicons[0].indexOf('favicon-pms') > 0 && process.platform === 'darwin') {
				// This api is only supported on macOS
				app.dock.setBadge('●');
			}
		});

		this.$el.addEventListener('dom-ready', () => {
			console.log('dom-ready');
			if (this.props.role === 'server') {
				this.$el.classList.add('onload');
			}
			this.show();
		});

		this.$el.addEventListener('did-fail-load', event => {
			const { errorDescription } = event;
			const hasConnectivityErr = (SystemUtil.connectivityERR.indexOf(errorDescription) >= 0);
			console.log('dom-fail-load', event, errorDescription, hasConnectivityErr);
			if (hasConnectivityErr) {
				console.error('error', errorDescription);
				this.props.onNetworkError();
			}
		});

		this.$el.addEventListener('did-start-loading', () => {
			console.log('dom-start-loading');
			let userAgent = SystemUtil.getUserAgent();
			if (!userAgent) {
				SystemUtil.setUserAgent(this.$el.getUserAgent());
				userAgent = SystemUtil.getUserAgent();
			}
			this.$el.setUserAgent(userAgent);
		});
	}

	getBadgeCount(title) {
		const messageCountInTitle = (/\(([0-9]+)\)/).exec(title);
		return messageCountInTitle ? Number(messageCountInTitle[1]) : 0;
	}

	show() {
		// Do not show WebView if another tab was selected and this tab should be in background.
		if (!this.props.isActive()) {
			return;
		}

		this.$el.classList.remove('disabled');
		this.$el.classList.add('active');
		setTimeout(() => {
			if (this.props.role === 'server') {
				this.$el.classList.remove('onload');
			}
		}, 1000);
		this.focus();
		this.loading = false;
		this.props.onTitleChange();
		// Injecting preload css in webview to override some css rules
		this.$el.insertCSS(fs.readFileSync(path.join(__dirname, '/../../css/preload.css'), 'utf8'));

		// get customCSS again from config util to avoid warning user again
		this.customCSS = ConfigUtil.getConfigItem('customCSS');
		if (this.customCSS) {
			if (!fs.existsSync(this.customCSS)) {
				this.customCSS = null;
				ConfigUtil.setConfigItem('customCSS', null);

				const errMsg = 'The custom css previously set is deleted!';
				dialog.showErrorBox('custom css file deleted!', errMsg);
				return;
			}

			this.$el.insertCSS(fs.readFileSync(path.resolve(__dirname, this.customCSS), 'utf8'));
		}
	}

	focus() {
		// focus Webview and it's contents when Window regain focus.
		const webContents = this.$el.getWebContents();
		if (webContents && !webContents.isFocused()) {
			this.$el.focus();
			webContents.focus();
		}
	}

	hide() {
		this.$el.classList.add('disabled');
		this.$el.classList.remove('active');
	}

	load() {
		if (this.$el) {
			this.show();
		} else {
			this.init();
		}
	}

	zoomIn() {
		this.zoomFactor += 0.1;
		this.$el.setZoomFactor(this.zoomFactor);
	}

	zoomOut() {
		this.zoomFactor -= 0.1;
		this.$el.setZoomFactor(this.zoomFactor);
	}

	zoomActualSize() {
		this.zoomFactor = 1.0;
		this.$el.setZoomFactor(this.zoomFactor);
	}

	logOut() {
		this.$el.executeJavaScript('logout()');
	}

	showShortcut() {
		this.$el.executeJavaScript('shortcut()');
	}

	openDevTools() {
		this.$el.openDevTools();
	}

	back() {
		if (this.$el.canGoBack()) {
			this.$el.goBack();
		}
	}

	canGoBackButton() {
		const $backButton = document.querySelector('#actions-container #back-action');
		if (this.$el.canGoBack()) {
			$backButton.classList.remove('disable');
		} else {
			$backButton.classList.add('disable');
		}
	}

	forward() {
		if (this.$el.canGoForward()) {
			this.$el.goForward();
		}
	}

	reload() {
		this.hide();
		this.$el.reload();
	}

	send(...param) {
		this.$el.send(...param);
	}
}

module.exports = WebView;
