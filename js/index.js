import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/js/std-js/theme-cookie.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/share-target.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import { toggleClass, ready, on } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { importGa, externalHandler, mailtoHandler, telHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { GA } from './consts.js';

toggleClass(document.documentElement, {
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
});

if (typeof GA === 'string') {
	requestIdleCallback(() => {
		importGa(GA).then(async ({ ga }) => {
			if (ga instanceof Function) {
				ga('create', GA, 'auto');
				ga('set', 'transport', 'beacon');
				ga('send', 'pageview');
				on(document.forms.contact, 'submit', () => {
					ga('send', {
						hitType: 'event',
						eventCategory: 'submit',
						eventAction: 'submit',
						eventLabel: 'Contact Form',
					});
				}, { passive: true, capture: true });
			}

			await ready();

			on('a[rel~="external"]', '.click', externalHandler, { passive: true, capture: true });
			on('a[href^="tel:"]', 'click', telHandler, { passive: true, capture: true });
			on('a[href^="mailto:"]', 'click', mailtoHandler, { passive: true, capture: true });
		});
	});
}
