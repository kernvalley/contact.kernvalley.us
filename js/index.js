import 'https://cdn.kernvalley.us/js/std-js/theme-cookie.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/share-target.js';
import 'https://cdn.kernvalley.us/components/install/prompt.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import { toggleClass, ready, loaded, on, attr } from 'https://cdn.kernvalley.us/js/std-js/dom.js';
import { getCustomElement } from 'https://cdn.kernvalley.us/js/std-js/custom-elements.js';
import { getGooglePolicy } from 'https://cdn.kernvalley.us/js/std-js/trust-policies.js';
import { importGa, externalHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { GA } from './consts.js';
import { submitHandler } from './functions.js';

toggleClass(document.documentElement, {
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
});

if (typeof GA === 'string') {
	loaded().then(() => {
		requestIdleCallback(() => {
			importGa(GA, {}, { policy: getGooglePolicy() }).then(async ({ send, hasGa, ga }) => {
				if (hasGa()) {
					ga('create', GA, 'auto');
					ga('set', 'transport', 'beacon');
					send('pageview');

					on([document.forms.contact], ['submit'], () => {
						send({
							hitType: 'event',
							eventCategory: 'submit',
							eventAction: 'submit',
							eventLabel: 'Contact Form',
						});
					}, { passive: true });

					on('a[rel~="external"]', ['click'], externalHandler, { passive: true });
				}
			});
		});
	});
}

getCustomElement('install-prompt').then(HTMLInstallPromptElement => {
	on('#install-btn', ['click'], () => new HTMLInstallPromptElement().show())
		.forEach(btn => btn.hidden = false);
});

ready().then(() => {
	attr('#contact-form fieldset, #contact-form button', { hidden: false, disabled: false });
	on([document.forms.contact], ['submit'], submitHandler);
});
