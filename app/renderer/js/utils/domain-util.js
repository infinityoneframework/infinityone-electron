'use strict';

const { app, dialog } = require('electron').remote;
const fs = require('fs');
const path = require('path');
const JsonDB = require('node-json-db');
const request = require('request');
const Logger = require('./logger-util');

const defaultRealmIcon = '/images/notification_logo.png';

const logger = new Logger({
	file: `domain-util.log`,
	timestamp: true
});

let instance = null;

let defaultIconUrl = '../renderer/img/icon-server.png';

if (process.platform === 'win32') {
	defaultIconUrl = path.normalize(defaultIconUrl);
}

// Fix https issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class DomainUtil {
	constructor() {
		if (instance) {
			return instance;
		} else {
			instance = this;
		}

		this.reloadDB();

		// Migrate from old schema
		if (this.db.getData('/').domain) {
			this.addDomain({
				alias: 'InfinityOne',
				url: this.db.getData('/domain')
			});
			this.db.delete('/domain');
		}

		return instance;
	}

	getDomains() {
		this.reloadDB();
		if (this.db.getData('/').domains === undefined) {
			return [];
		} else {
			return this.db.getData('/domains');
		}
	}

	getDomain(index) {
		this.reloadDB();
		return this.db.getData(`/domains[${index}]`);
	}

	updateDomain(index, server) {
		this.reloadDB();
		this.db.push(`/domains[${index}]`, server, true);
	}

	addDomain(server) {
		return new Promise(resolve => {
			if (server.icon) {
				this.saveServerIcon(server.icon).then(localIconUrl => {
					server.icon = localIconUrl;
					this.db.push('/domains[]', server, true);
					this.reloadDB();
					resolve();
				});
			} else {
				server.icon = defaultIconUrl;
				this.db.push('/domains[]', server, true);
				this.reloadDB();
				resolve();
			}
		});
	}

	removeDomains() {
		this.db.delete('/domains');
		this.reloadDB();
	}

	removeDomain(index) {
		this.db.delete(`/domains[${index}]`);
		this.reloadDB();
	}

	// Check if domain is already added
	duplicateDomain(domain) {
		domain = this.formatUrl(domain);
		const servers = this.getDomains();
		for (const i in servers) {
			if (servers[i].url === domain) {
				return true;
			}
		}
		return false;
	}

	checkDomain(domain, silent = false) {
		if (!silent && this.duplicateDomain(domain)) {
			// Do not check duplicate in silent mode
			return Promise.reject('This server has been added.');
		}

		domain = this.formatUrl(domain);

		const checkDomain = domain + defaultRealmIcon;

		const serverConf = {
			icon: defaultIconUrl,
			url: domain,
			alias: domain
		};

		return new Promise((resolve, reject) => {
			request(checkDomain, (error, response) => {
				const certsError =
					[
						'Error: self signed certificate',
						'Error: unable to verify the first certificate',
						'Error: unable to get local issuer certificate'
					];

				// If the domain contains following strings we just bypass the server
				const whitelistDomains = [
					'zulipdev.org',
					'localhost',
					'chat.spallen.com'
				];

				// make sure that error is a error or string not undefined
				// so validation does not throw error.
				error = error || '';
				if (!error && response.statusCode < 400) {
					// Correct
					this.getServerSettings(domain).then(serverSettings => {
						resolve(serverSettings);
					}, () => {
						resolve(serverConf);
					});
				} else if (domain.indexOf(whitelistDomains) >= 0 || certsError.indexOf(error.toString()) >= 0) {
					if (silent) {
						this.getServerSettings(domain).then(serverSettings => {
							resolve(serverSettings);
						}, () => {
							resolve(serverConf);
						});
					} else {
						const certErrorMessage = `Do you trust certificate from ${domain}? \n ${error}`;
						const certErrorDetail = `The server you're connecting to is either someone impersonating the Infinity One server you entered, or the server you're trying to connect to is configured in an insecure way.
						\n Unless you have a good reason to believe otherwise, you should not proceed.
						\n You can click here if you'd like to proceed with the connection.`;

						dialog.showMessageBox({
							type: 'warning',
							buttons: ['Yes', 'No'],
							defaultId: 0,
							message: certErrorMessage,
							detail: certErrorDetail
						}, response => {
							if (response === 0) {
								this.getServerSettings(domain).then(serverSettings => {
									resolve(serverSettings);
								}, () => {
									resolve(serverConf);
								});
							} else {
								reject('Untrusted Certificate.');
							}
						});
					}
				} else {
					const invalidOneServerError = `${domain} does not appear to be a valid Infinity One server. Make sure that \
					\n(1) you can connect to that URL in a web browser and \n (2) if you need a proxy to connect to the Internet, that you've configured your proxy in the Network settings \n (3) its an Infinity One server`;
					reject(invalidOneServerError);
				}
			});
		});
	}

	getServerSettings(domain) {
		const serverSettingsUrl = domain + '/api/v1/server_settings';
		return new Promise((resolve, reject) => {
			request(serverSettingsUrl, (error, response) => {
				if (!error && response.statusCode === 200) {
					try {
						const data = JSON.parse(response.body);
						if (data.hasOwnProperty('realm_uri')) {
							let realmIcon;

							if (data.realm_icon) {
								realmIcon = data.realm_icon;
							} else {
								realmIcon = defaultIconUrl;
							}

							resolve({
								// Some InfinityOne Servers use absolute URL for server icon whereas others use relative URL
								// Following check handles both the cases
								icon: realmIcon.startsWith('/') ? data.realm_uri + realmIcon : realmIcon,
								iconUrl: realmIcon,
								url: data.realm_uri,
								alias: data.realm_name
							});
						}
					} catch (err) {
						reject('Infinity One server invalid response');
					}
				} else {
					reject('Infinity One server invalid version.');
				}
			});
		});
	}

	saveServerIcon(url) {
		// The save will always succeed. If url is invalid, downgrade to default icon.
		return new Promise(resolve => {
			const filePath = this.generateFilePath(url);
			const file = fs.createWriteStream(filePath);
			try {
				request(url).on('response', response => {
					response.on('error', err => {
						console.log(err);
						resolve(defaultIconUrl);
					});
					response.pipe(file).on('finish', () => {
						resolve(filePath);
					});
				}).on('error', err => {
					console.log(err);
					resolve(defaultIconUrl);
				});
			} catch (err) {
				console.log(err);
				resolve(defaultIconUrl);
			}
		});
	}

	updateSavedServer(url, index) {
		// Does not promise successful update
		this.checkDomain(url, true).then(newServerConf => {
			this.saveServerIcon(newServerConf.icon).then(localIconUrl => {
				newServerConf.icon = localIconUrl;
				this.updateDomain(index, newServerConf);
				this.reloadDB();
			});
		});
	}

	reloadDB() {
		const domainJsonPath = path.join(app.getPath('userData'), '/domain.json');
		try {
			const file = fs.readFileSync(domainJsonPath, 'utf8');
			JSON.parse(file);
		} catch (err) {
			if (fs.existsSync(domainJsonPath)) {
				fs.unlinkSync(domainJsonPath);
				dialog.showErrorBox(
					'Error saving new server',
					'There seems to be error while saving new server, ' +
					'you may have to re-add your previous servers back.'
				);
				logger.error('Error while JSON parsing domain.json: ');
				logger.error(err);
			}
		}
		this.db = new JsonDB(domainJsonPath, true, true);
	}

	generateFilePath(url) {
		const dir = `${app.getPath('userData')}/server-icons`;
		const extension = path.extname(url).split('?')[0];

		let hash = 5381;
		let len = url.length;

		while (len) {
			hash = (hash * 33) ^ url.charCodeAt(--len);
		}

		// Create 'server-icons' directory if not existed
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		return `${dir}/${hash >>> 0}${extension}`;
	}

	formatUrl(domain) {
		const link = 'https://' + domain.replace(/https?:\/\//, '');

		if (link.match(/:\d+$/)) {
			return link;
		} else {
			return link + ':21326';
		}
	}
}

module.exports = new DomainUtil();
