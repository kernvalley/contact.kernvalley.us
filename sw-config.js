/* eslint no-unused-vars: 0 */
/* eslint-env serviceworker */
const config = {
	version: '1.0.0',
	fresh: [
		'https://apps.kernvalley.us/apps.json',
	].map(url => new URL(url, location.origin).href),
	stale: [
		'/',
		'/js/index.min.js',
		'/css/index.min.css',
		'/img/icons.svg',
		'https://cdn.kernvalley.us/components/toast-message.html',
		'https://cdn.kernvalley.us/components/toast-message.css',
		'https://cdn.kernvalley.us/components/github/user.html',
		'https://cdn.kernvalley.us/components/github/user.css',
		'https://cdn.kernvalley.us/components/pwa/prompt.html',
		'https://cdn.kernvalley.us/components/pwa/prompt.css',
		/* Social Icons for Web Share API shim */
		'https://cdn.kernvalley.us/img/branding/kernvalley.us.svg',
	].map(path => new URL(path, location.origin).href),
	allowed: [
		/https:\/\/i\.imgur\.com\/*/,
		/https:\/\/api\.github\.com\/users\/*/,
	]
};
