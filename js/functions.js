import { attr } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { sha256 } from 'https://cdn.kernvalley.us/js/std-js/hash.js';
import { uuidv6 } from 'https://cdn.kernvalley.us/js/std-js/uuid.js';
import { alert } from 'https://cdn.kernvalley.us/js/std-js/asyncDialog.js';

export async function signatureHeaders({ uuid }) {
	const date = new Date().toISOString();

	return new Headers({
		'X-MESSAGE-ID': uuid,
		'X-MESSAGE-TIME': date,
		'X-MESSAGE-ORIGIN': location.origin,
		'X-MESSAGE-SIG': await sha256(JSON.stringify({ uuid, date, origin: location.origin })),
		'X-MESSAGE-ALGO': 'sha256',
	});
}

export async function submitHandler(event) {
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
		const headers = await signatureHeaders({ uuid });

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
}
