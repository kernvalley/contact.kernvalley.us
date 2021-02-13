import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/js/std-js/theme-cookie.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/share-target.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import { sha256 } from 'https://cdn.kernvalley.us/js/std-js/hash.js';
import { uuidv6 } from 'https://cdn.kernvalley.us/js/std-js/uuid.js';
import { alert } from 'https://cdn.kernvalley.us/js/std-js/asyncDialog.js';
import { toggleClass, ready, on, attr } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
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

			on('a[rel~="external"]', 'click', externalHandler, { passive: true, capture: true });
			on('a[href^="tel:"]', 'click', telHandler, { passive: true, capture: true });
			on('a[href^="mailto:"]', 'click', mailtoHandler, { passive: true, capture: true });
		});
	});
}

ready().then(() => {
	attr('#contact-form fieldset, #contact-form button', { hidden: false, disabled: false });
	on(document.forms.contact, 'submit', async event => {
		event.preventDefault();
		const form = event.target;
		const body = new FormData(form);
		attr('#contact-form fieldset, #contact-form button', { disabled: true });
		const uuid = uuidv6();
		const date = new Date().toISOString();

		body.set('origin', location.origin);
		body.delete('check');
		const url = new URL(form.action, location.origin);

		try {
			const headers = new Headers({
				'X-MESSAGE-ID': uuid,
				'X-MESSAGE-TIME': date,
				'X-MESSAGE-ORIGIN': location.origin,
				'X-MESSAGE-SIG': await sha256(JSON.stringify({ uuid, date, origin: location.origin })),
				'X-MESSAGE-ALGO': 'sha256',
			});

			const resp = await fetch(url, { method: 'POST', body, headers });

			if (resp.ok) {
				alert('Message sent');
				form.reset();
			} else {
				const { error } = await resp.json();

				if (typeof error.message === 'string') {
					alert(error.message);
				} else {
					alert('An unknown error occured sending message');
				}
			}
		} catch(err) {
			console.error(err);
			alert('An unknown error occured sending message');
		} finally {
			attr('#contact-form fieldset, #contact-form button', { disabled: false });
		}
	});
});
