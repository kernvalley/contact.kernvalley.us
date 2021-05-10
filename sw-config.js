/* eslint no-unused-vars: 0 */
/* eslint-env serviceworker */
/* 2021-02-14T09:32 */

const config = {
	version: '1.1.1',
	fresh: [
		'https://apps.kernvalley.us/apps.json',
	].map(url => new URL(url, location.origin).href),
	stale: [
		'/',
		'/js/index.min.js',
		'/css/index.min.css',
		'/img/icons.svg',
		'/manifest.json',
		'https://cdn.kernvalley.us/components/toast-message.html',
		'https://cdn.kernvalley.us/components/toast-message.css',
		'https://cdn.kernvalley.us/components/github/user.html',
		'https://cdn.kernvalley.us/components/github/user.css',
		'https://cdn.kernvalley.us/components/install/prompt.html',
		'https://cdn.kernvalley.us/components/install/prompt.css'
		'https://cdn.kernvalley.us/img/branding/kernvalley.us.svg',
		'https://cdn.kernvalley.us/img/keep-kern-clean.svg',
		'https://cdn.kernvalley.us/img/logos/instagram.svg',
	].map(path => new URL(path, location.origin).href),
	allowed: [
		'https://i.imgur.com/',
		/https:\/\/\\w+\.githubusercontent\.com\/u\//,
		/\.(jpg|png|gif|webp|svg)$/,
	],
	allowedFresh: [
		'https://api.github.com/users',
		/\.(json|html|css|js)$/,
	]
};
