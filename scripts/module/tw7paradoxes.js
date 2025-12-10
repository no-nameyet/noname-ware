'use strict';
import pdx_search, { skills, } from 'https://no-nameyet.github.io/twwwwwww-tools-paradox/pdx-search.js';
let pdx = pdx_search();

// スキル一覧
(_ => {
	let element = document.querySelector('tag-selector');
	for (let skill of skills()) {
		element.appendOption(skill.id, skill.skill);
	}
})();

document.querySelector('.m-tw7pdx__execute').addEventListener('click', async event => {
	document.querySelector('loading-dialog').dispatchEvent(new CustomEvent('loading-dialog::show', {
		bubbles: true,
		composed: true,
		cancelable: true,
		detail: {},
	}));
	pdx.resetCondition();
	pdx.entryPow1 = document.querySelector('[data-condition="pow1"]').value;
	pdx.entryPow2 = document.querySelector('[data-condition="pow2"]').value;
	pdx.entryPow3 = document.querySelector('[data-condition="pow3"]').value;
	pdx.entryPow4 = document.querySelector('[data-condition="pow4"]').value;
	pdx.entrySpd1 = document.querySelector('[data-condition="spd1"]').value;
	pdx.entrySpd2 = document.querySelector('[data-condition="spd2"]').value;
	pdx.entrySpd3 = document.querySelector('[data-condition="spd3"]').value;
	pdx.entrySpd4 = document.querySelector('[data-condition="spd4"]').value;
	pdx.entryWiz1 = document.querySelector('[data-condition="wiz1"]').value;
	pdx.entryWiz2 = document.querySelector('[data-condition="wiz2"]').value;
	pdx.entryWiz3 = document.querySelector('[data-condition="wiz3"]').value;
	pdx.entryWiz4 = document.querySelector('[data-condition="wiz4"]').value;
	pdx.filterMaxSkillBound = document.querySelector('[data-condition="maxSkill"]').value;
	pdx.filterIncludeSkill = document.querySelector('[data-condition="skills"]').values.map(value => parseInt(value, 10));
	let result = await pdx.generate();
	document.querySelector('.m-tw7pdx__result').innerHTML = '';
	document.querySelector('.m-tw7pdx__message').textContent = '';
	if (result.length <= 0) {
		document.querySelector('.m-tw7pdx__message').textContent = '当てはまる組み合わせは見つかりませんでした。';
	} else {
		if (result.length > 250) {
			document.querySelector('.m-tw7pdx__message').textContent = '250件以上は表示できません。';
		}
		const fragment = document.createDocumentFragment();
		result.forEach(data => {
			const dataNode = document.importNode(document.querySelector('.template-tw7pdx__data').content, true);
			const dataTag = dataNode.querySelector('.m-tw7pdx__data');
			fragment.appendChild(dataNode);
			data.forEach(paradox => {
				const paradoxNode = document.importNode(document.querySelector('.template-tw7pdx__paradox').content, true);
				const paradoxTag = paradoxNode.querySelector('.m-tw7pdx__data-paradox');
				dataTag.appendChild(paradoxNode);
				paradoxTag.classList.toggle('m-tw7pdx__data-paradox--pow', paradox.status === 'POW');
				paradoxTag.classList.toggle('m-tw7pdx__data-paradox--spd', paradox.status === 'SPD');
				paradoxTag.classList.toggle('m-tw7pdx__data-paradox--wiz', paradox.status === 'WIZ');
				paradoxTag.querySelector('.m-tw7pdx__data-paradox-name').textContent = paradox.name;
				paradoxTag.querySelector('.m-tw7pdx__data-paradox-type').textContent = `${paradox.status}:${paradox.target}`;
				paradox.skills.forEach(skill => {
					const skillNode = document.importNode(document.querySelector('.template-tw7pdx__data-paradox-skill').content, true);
					const skillTag = skillNode.querySelector('.m-tw7pdx__data-paradox-skill');
					paradoxTag.appendChild(skillNode);
					skillTag.textContent = skill;
				});
			});
		});
		document.querySelector('.m-tw7pdx__result').appendChild(fragment);
	}
	document.querySelector('loading-dialog').dispatchEvent(new CustomEvent('loading-dialog::close', {
		bubbles: true,
		composed: true,
		cancelable: true,
		detail: {},
	}));
});

// ダイアログを閉じる
document.querySelector('loading-dialog').dispatchEvent(new CustomEvent('loading-dialog::close', {
	bubbles: true,
	composed: true,
	cancelable: true,
	detail: {},
}));
