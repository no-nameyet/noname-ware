'use strict';

/*	=====================================================
	メニューストレージ
	===================================================== */
/** メニューストレージ */
class CustomMenuStorage extends LocalStorage {
	/** ストレージバージョン */
	static #VERSION = 20250914;

	static #STORAGE = null;

	static #menu = {};

	/** ストレージの読み込み */
	static load() {
		if (this.#STORAGE == null) {
			this.#menu = {};
			MENU_LIST.forEach(group => {
				group.list.forEach(title => {
					title.list.forEach(tool => {
						this.#menu[tool.key] = tool;
					});
				});
			});

			this.#STORAGE = new CustomMenuStorage();
		}
		return this.#STORAGE;
	}

	/** コンストラクタ */
	constructor() {
		super('customMenu', CustomMenuStorage.#VERSION);
	}

	/** バージョン更新処理 */
	update(oldVersion, data) {
		// メニューの更新処理
		{
			data.list = (data.list ?? []).filter(key => key in CustomMenuStorage.#menu);

			const updatedDetails = {};
			data.list.forEach(key => {
				updatedDetails[key] = CustomMenuStorage.#menu[key];
			});
			data.details = updatedDetails;
		}
		return data;
	}

	isExists(key) {
		const menu = this.#getMenu();
		return menu.list.includes(key);
	}

	/** メニューを追加 */
	append(key) {
		const menu = this.#getMenu();
		if (!this.isExists(key)) {
			menu.list.push(key);
		}
		menu.details[key] = CustomMenuStorage.#menu[key];
		this.#setMenu(menu);
		this.dispatchEvent(new CustomEvent('menu-storage::append', {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: {
				key,
				info: CustomMenuStorage.#menu[key],
			},
		}));
	}

	/**
	 * メニューを削除
	 * @param {string} key
	 */
	remove(key) {
		const menu = this.#getMenu();
		menu.list = menu.list.filter(item => item !== key);
		delete menu.details[key];
		this.#setMenu(menu);
		this.dispatchEvent(new CustomEvent('menu-storage::remove', {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: {
				key,
			},
		}));
	}

	/** 削除 */
	clear() {
		this.#setMenu({
			list: [],
			details: {},
		});
		this.dispatchEvent(new CustomEvent('menu-storage::clear', {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: {},
		}));
	}

	get list() {
		const menu = this.#getMenu();
		return menu.list.map(key => menu.details[key]);
	}

	/**
	 * ストレージからメニュー情報を取得
	 * @returns {{ list: string[], details: Record<string, { name: string, url: string }> }}
	 */
	#getMenu() {
		return this.get();
	}

	/**
	 * ストレージにメニュー情報を保存
	 * @param {{ list: string[], details: Record<string, { name: string, url: string }> }} menu
	 */
	#setMenu(menu) {
		this.set(menu);
	}
}
