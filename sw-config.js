/* eslint no-unused-vars: 0 */
/* eslint-env serviceworker */

const config = {
	version: '2.0.0',
	fresh: [
		'https://apps.kernvalley.us/apps.json',
	].map(url => new URL(url, location.origin).href),
	stale: [
		'/',
		'/js/index.min.js',
		'/css/index.min.css',
		'/img/icons.svg',
		'/manifest.json',
		'https://unpkg.com/@shgysk8zer0/polyfills@0.0.7/all.min.js',
		'https://unpkg.com/@shgysk8zer0/kazoo@0.0.12/harden.js',
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
