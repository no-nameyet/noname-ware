'use strict';
// ヘッダーの用意
document.querySelector('header').innerHTML = `
	<div class="l-header__home">
		<a href="." class="l-header__button">🏠</a>
	</div>
	<nav class="l-header__nav">
		<div class="l-header__append">
			<button type="button" class="l-header__button" data-action="menuOpen">⊕</button>
		</div>
		<menu-header class="l-header__menu"></menu-header>
	</nav>
	<div class="l-header__help">
		<button type="button" class="l-header__button" data-action="helpOpen">💡</button>
	</div>
`;

// ヘルプダイアログ
HelpDialog.include();
document.querySelector('[data-action="helpOpen"]').addEventListener("click", event => {
	document.querySelector('help-dialog').dispatchEvent(new CustomEvent('help-dialog::show', {
		detail: {},
	}));
});

// カスタムメニュー
MenuDialog.include();
MenuHeader.include();
document.querySelector('[data-action="menuOpen"]').addEventListener("click", event => {
	document.querySelector('menu-dialog').dispatchEvent(new CustomEvent('menu-dialog::show', {
		detail: {},
	}));
});

// ローディングダイアログ
LoadingDialog.include();
