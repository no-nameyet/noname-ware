'use strict';

/*	=====================================================
	ヘルプダイアログ
	===================================================== */
/** ヘルプダイアログ */
class HelpDialog extends CustomDialog {
	// ドキュメントルート
	static #htmlUrls;
	static #cssUrls;

	#hasToolHelp = false;

	// staticイニシャライザ
	static {
		const scriptPath = document.currentScript?.src;
		this.#htmlUrls = [
			new URL('./help-dialog/help-dialog.html', scriptPath),
		];
		this.#cssUrls = [
			new URL('../style/destyle.css', scriptPath),
			new URL('../style/base.css', scriptPath),
			new URL('./page-ui.css', scriptPath),
			new URL('./help-dialog/help-dialog.css', scriptPath),
		];
	}

	// カスタム要素を定義
	static include(tagName = 'help-dialog') {
		if (!customElements.get(tagName)) {
			customElements.define(tagName, HelpDialog);
		}
	}

	// 要素の呼び出し
	async connectedCallback() {
		// リソースの読み込み
		await this.loadResources({
			htmlUrls: HelpDialog.#htmlUrls,
			cssUrls: HelpDialog.#cssUrls,
		});
		// メニューダイアログを開くボタンイベント
		this.addEventListener('help-dialog::show', event => {
			this.showModal();
			if (this.#hasToolHelp) {
				this.shadowRoot.querySelector('[data-help="tool"]').checked = true;
			} else {
				this.shadowRoot.querySelector('[data-help="site"]').checked = true;
			}
		});
		await super.connectedCallback();
	}

	#toolHelp = '';
	#siteHelp = '';

	set toolHelp(markdown = '') {
		this.#toolHelp = marked.parse(markdown);
		this.afterLoaded();
	}

	set siteHelp(markdown = '') {
		this.#siteHelp = marked.parse(markdown);
		this.afterLoaded();
	}

	updateElement() {
		const toolHelp = this.shadowRoot.querySelector('.ctm-dialog-help__tab-text--tool');
		toolHelp.innerHTML = this.#toolHelp;
		if (this.#toolHelp === '') {
			toolHelp.setAttribute('disabled', '');
		} else {
			toolHelp.removeAttribute('disabled');
		}
		this.#hasToolHelp = (this.#toolHelp !== '');

		const siteHelp = this.shadowRoot.querySelector('.ctm-dialog-help__tab-text--site');
		siteHelp.innerHTML = this.#siteHelp;
	}
}

/*	=====================================================
	ローディングダイアログ
	===================================================== */
/** ローディングダイアログ */
class LoadingDialog extends CustomDialog {
	// ドキュメントルート
	static #htmlUrls;
	static #cssUrls;

	// staticイニシャライザ
	static {
		const scriptPath = document.currentScript?.src;
		this.#htmlUrls = [
			new URL('./loading-dialog/loading-dialog.html', scriptPath),
		];
		this.#cssUrls = [
			new URL('../style/destyle.css', scriptPath),
			new URL('../style/base.css', scriptPath),
			new URL('./page-ui.css', scriptPath),
			new URL('./loading-dialog/loading-dialog.css', scriptPath),
		];
	}

	// カスタム要素を定義
	static include(tagName = 'loading-dialog') {
		if (!customElements.get(tagName)) {
			customElements.define(tagName, LoadingDialog);
		}
	}

	// 要素の呼び出し
	async connectedCallback() {
		// メニューダイアログを開くボタンイベント
		this.addEventListener('loading-dialog::show', event => this.showModal());
		// メニューダイアログを開くボタンイベント
		this.addEventListener('loading-dialog::close', event => this.close());
		// リソースの読み込み
		await this.loadResources({
			htmlUrls: LoadingDialog.#htmlUrls,
			cssUrls: LoadingDialog.#cssUrls,
		});
		await super.connectedCallback();
	}
}



/*	=====================================================
	メニューダイアログ
	===================================================== */
/** メニューダイアログ */
class MenuDialog extends CustomDialog {
	// ドキュメントルート
	static #htmlUrls;
	static #cssUrls;

	static #storage = CustomMenuStorage.load();

	// staticイニシャライザ
	static {
		const scriptPath = document.currentScript?.src;
		this.#htmlUrls = [
			new URL('./custom-menu/menu-dialog.html', scriptPath),
		];
		this.#cssUrls = [
			new URL('../style/destyle.css', scriptPath),
			new URL('../style/base.css', scriptPath),
			new URL('./page-ui.css', scriptPath),
			new URL('./custom-menu/menu-dialog.css', scriptPath),
		];
	}

	// カスタム要素を定義
	static include(tagName = 'menu-dialog') {
		if (!customElements.get(tagName)) {
			customElements.define(tagName, MenuDialog);
		}
	}

	// 要素の呼び出し
	async connectedCallback() {
		// リソースの読み込み
		await this.loadResources({
			htmlUrls: MenuDialog.#htmlUrls,
			cssUrls: MenuDialog.#cssUrls,
		});
		// カスタムメニュー追加／削除ボタン
		this.shadowRoot.querySelector('[data-action="menuAppend"]').addEventListener('click', event => {
			const button = event.target;
			if (button.matches('[data-menu-key]')) {
				if (button.classList.contains('ctm-dialog-menu__menu-append--remove')) {
					this.dispatchEvent(new CustomEvent('menu-dialog::menu-remove', {
						detail: {
							key: button.dataset.menuKey,
						},
					}));
				} else {
					this.dispatchEvent(new CustomEvent('menu-dialog::menu-append', {
						detail: {
							key: button.dataset.menuKey,
						},
					}));
				}
			}
		});
		this.#loadMenu();
		// メニューダイアログを開くボタンイベント
		this.addEventListener('menu-dialog::show', event => this.showModal());
		// 追加ボタンイベント
		this.addEventListener('menu-dialog::menu-append', event => this.appendMenu(event.detail.key));
		// 削除ボタンイベント
		this.addEventListener('menu-dialog::menu-remove', event => this.removeMenu(event.detail.key));
		MenuDialog.#storage.addEventListener('menu-storage::append', event => this.#toggleButton(event.detail.key));
		MenuDialog.#storage.addEventListener('menu-storage::remove', event => this.#toggleButton(event.detail.key));
		MenuDialog.#storage.addEventListener('menu-storage::clear', event => {
			this.shadowRoot.querySelectorAll('[data-menu-key]').forEach(element => {
				this.#toggleButton(element.dataset.menuKey);
			});
		});
		await super.connectedCallback();
	}

	#toggleButton(key) {
		// ボタンを変更
		const button = this.shadowRoot.querySelector(`[data-menu-key="${key}"]`);
		button.classList.toggle('ctm-dialog-menu__menu-append--remove', MenuDialog.#storage.isExists(key));
	}

	/** カスタムメニューへの追加 */
	appendMenu(key) {
		MenuDialog.#storage.append(key);
	}

	/** カスタムメニューから削除 */
	removeMenu(key) {
		MenuDialog.#storage.remove(key);
	}

	#loadMenu() {
		const list = this.shadowRoot.querySelector(`.ctm-dialog-menu__list`);
		MENU_LIST.forEach(group => {
			const groupNode = document.importNode(this.shadowRoot.querySelector('.template-dialog-menu__menu-group').content, true);
			const groupTag = groupNode.querySelector('.ctm-dialog-menu__menu-group');
			list.appendChild(groupNode);
			group.list.forEach(title => {
				const titleNode = document.importNode(this.shadowRoot.querySelector('.template-dialog-menu__menu-title').content, true);
				const titleTag = titleNode.querySelector('.ctm-dialog-menu__menu-title');
				groupTag.appendChild(titleNode);
				Object.assign(titleTag, {
					textContent: title.name,
				});
				title.list.forEach(tool => {
					const toolNode = document.importNode(this.shadowRoot.querySelector('.template-dialog-menu__menu-tool').content, true);
					const toolTag = toolNode.querySelector('.ctm-dialog-menu__menu-tool');
					groupTag.appendChild(toolNode);
					toolTag.querySelector('.ctm-dialog-menu__menu-append').dataset.menuKey = tool.key;
					Object.assign(toolTag.querySelector('.ctm-dialog-menu__menu-link'), {
						href: tool.url,
					});
					Object.assign(toolTag.querySelector('.ctm-dialog-menu__menu-icon'), {
						textContent: tool.key,
					});
					Object.assign(toolTag.querySelector('.ctm-dialog-menu__menu-name'), {
						textContent: tool.name,
					});
					this.#toggleButton(tool.key);
				});
			});
		});
	}
}

class MenuHeader extends CustomComponent {
	// ドキュメントルート
	static #htmlUrls;
	static #cssUrls;

	static #storage = CustomMenuStorage.load();

	#eventAppend = event => {
		this.#renderMenu();
	};
	#eventRemove = event => {
		this.#renderMenu();
	};
	#eventClear = event => {
		this.#renderMenu();
	};

	// staticイニシャライザ
	static {
		const scriptPath = document.currentScript?.src;
		this.#htmlUrls = [
			new URL('./custom-menu/header-menu.html', scriptPath),
		];
		this.#cssUrls = [
			new URL('../style/destyle.css', scriptPath),
			new URL('../style/base.css', scriptPath),
			new URL('./page-ui.css', scriptPath),
			new URL('./custom-menu/header-menu.css', scriptPath),
		];
	}

	// カスタム要素を定義
	static include(tagName = 'menu-header') {
		if (!customElements.get(tagName)) {
			customElements.define(tagName, MenuHeader);
		}
	}

	// 要素の呼び出し
	async connectedCallback() {
		// リソースの読み込み
		await this.loadResources({
			htmlUrls: MenuHeader.#htmlUrls,
			cssUrls: MenuHeader.#cssUrls,
		});
		this.#renderMenu(true);

		MenuHeader.#storage.addEventListener('menu-storage::append', this.#eventAppend);
		MenuHeader.#storage.addEventListener('menu-storage::remove', this.#eventRemove);
		MenuHeader.#storage.addEventListener('menu-storage::clear', this.#eventClear);
		await super.connectedCallback();
	}
	// 要素の削除
	disconnectedCallback() {
		MenuHeader.#storage.removeEventListener('menu-storage::append', this.#eventAppend);
		MenuHeader.#storage.removeEventListener('menu-storage::remove', this.#eventRemove);
		MenuHeader.#storage.removeEventListener('menu-storage::clear', this.#eventClear);
	}

	#renderMenu(isInit = false) {
		const fragment = document.createDocumentFragment();
		MenuHeader.#storage.list.forEach(menu => {
			const listNode = document.importNode(this.shadowRoot.querySelector('.template-custom-menu__row').content, true);
			const listTag = listNode.querySelector('.ctm-custom-menu__row');
			fragment.appendChild(listNode);
			listTag.dataset.customMenu = menu.key;
			Object.assign(listTag.querySelector('.ctm-custom-menu__button'), {
				textContent: menu.key,
				title: menu.name,
				href: menu.url,
			});
			listTag.classList.toggle('ctm-custom-menu__row--pop_in', (!this.shadowRoot.querySelector(`[data-custom-menu="${menu.key}"]`) && !isInit));
		});

		const list = this.shadowRoot.querySelector(`.ctm-custom-menu__menu`);
		list.innerHTML = '';
		list.appendChild(fragment);
	}
}
