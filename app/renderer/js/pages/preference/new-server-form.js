'use strict';

const BaseComponent = require(__dirname + '/../../components/base.js');
const DomainUtil = require(__dirname + '/../../utils/domain-util.js');
// const shell = require('electron').shell;

class NewServerForm extends BaseComponent {
	constructor(props) {
		super();
		this.props = props;
	}

	template() {
		return `
			<div class="server-input-container">
				<div class="title">Infinity One URL</div>
				<div class="add-server-info-row">
					<input class="setting-input-value" autofocus placeholder="your-infinity-one-server"/>
				</div>
				<div class="server-center">
					<div class="server-save-action">
						<button id="connect">Connect</button>
					</div>
				</div>
				<div class="server-center">
				</div>
			</div>
		`;
	}

	init() {
		this.initForm();
		this.initActions();
	}

	initForm() {
		this.$newServerForm = this.generateNodeFromTemplate(this.template());
		this.$saveServerButton = this.$newServerForm.getElementsByClassName('server-save-action')[0];
		this.props.$root.innerHTML = '';
		this.props.$root.appendChild(this.$newServerForm);

		this.$newServerUrl = this.$newServerForm.querySelectorAll('input.setting-input-value')[0];
	}

	submitFormHandler() {
		this.$saveServerButton.children[0].innerHTML = 'Connecting...';
		DomainUtil.checkDomain(this.$newServerUrl.value).then(serverConf => {
			DomainUtil.addDomain(serverConf).then(() => {
				this.props.onChange(this.props.index);
			});
		}, errorMessage => {
			this.$saveServerButton.children[0].innerHTML = 'Connect';
			alert(errorMessage);
		});
	}

	initActions() {
		this.$saveServerButton.addEventListener('click', () => {
			this.submitFormHandler();
		});
		this.$newServerUrl.addEventListener('keypress', event => {
			const EnterkeyCode = event.keyCode;
			// Submit form when Enter key is pressed
			if (EnterkeyCode === 13) {
				this.submitFormHandler();
			}
		});
	}
}

module.exports = NewServerForm;
