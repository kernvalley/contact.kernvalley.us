import { attr } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { alert } from 'https://cdn.kernvalley.us/js/std-js/asyncDialog.js';
import { send } from 'https://cdn.kernvalley.us/js/std-js/slack.js';

export async function submitHandler(event) {
	event.preventDefault();
	const form = event.target;

	try {
		const data = new FormData(form);
		attr('#contact-form fieldset, #contact-form button', { disabled: true });
		const { success = false, body = {}} = await send(form.action, {
			name: data.get('name'),
			email: data.get('email'),
			phone: data.get('phone'),
			subject: data.get('subject'),
			body: data.get('body'),
		});

		if (success) {
			alert('Message sent');
			form.reset();
		} else if ('error' in body && typeof body.error.message === 'string') {
			alert(body.error.message);
		} else {
			alert('An unknown error occured sending message');
		}
	} catch(err) {
		console.error(err);
		alert('An unknown error occured sending message');
	} finally {
		attr('#contact-form fieldset, #contact-form button', { disabled: false });
	}
}
