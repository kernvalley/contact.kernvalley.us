/* eslint-env node */
const { HTTPError } = require('./http-error');
const ALLOWED_ORIGINS = [
	'kernvalley.us',
	'whiskeyflatdays.com',
	new URL(process.env.BASE_URL || 'http://localhost').hostname,
];

function allowedOrigin(url) {
	const { URL } = require('url');
	const { hostname, protocol } = new URL(url);

	return protocol === 'https:' && (ALLOWED_ORIGINS.includes(hostname)
		|| hostname.endsWith('.kernvalley.us'));
}

exports.handler = async function(event) {
	try {
		if (event.httpMethod === 'POST') {
			if (typeof process.env.SLACK_WEBHOOK !== 'string') {
				throw new HTTPError('Not configured', 501);
			}

			const { postData } = require('./post-data');
			const { isEmail, isString, isUrl, isTel, validateMessageHeaders,
				formatPhoneNumber } = require('./validation');

			const {
				fields: { subject, body, email, name, phone, origin, check } = {}
			} = await postData(event);

			if (isString(check, { minLength: 0 })) {
				throw new HTTPError('Invalid data submitted', 400);
			} else if (! validateMessageHeaders(event)) {
				throw new HTTPError('Invalid or missing signature', 400);
			} else if (! isString(subject, { minLength: 4 })) {
				throw new HTTPError('No subject given', 400);
			} else if (! isString(body, { minLength: 4 })) {
				throw new HTTPError('No body given', 400);
			} else if (! isString(name, 4)) {
				throw new HTTPError('No name given', 400);
			} else if (! isEmail(email)) {
				throw new HTTPError('No email address given or email is invalid', 400);
			} else if (! isUrl(origin)) {
				throw new HTTPError('Missing or invalid origin for message', 400);
			} else if (! allowedOrigin(origin) || ! allowedOrigin(event.headers.origin)) {
				throw new HTTPError('Not allowed', 400);
			}

			const fetch = require('node-fetch');
			const message = {
				channel: '#message',
				text: `New Messsage on ${origin}`,
				blocks: [{
					type: 'header',
					text: {
						type: 'plain_text',
						text:`Subject: ${subject}`
					}
				}, {
					type: 'section',
					fields: [{
						type: 'plain_text',
						text: `From: ${name}`,
					}, {
						type: 'mrkdwn',
						text: `Email: ${email}`,
					}, {
						type: 'mrkdwn',
						text: `Phone: ${isTel(phone) ? formatPhoneNumber(phone) : 'Not given'}`,
					}, {
						type: 'mrkdwn',
						text: `Site: ${origin}`,
					}]
				}, {
					type: 'divider',
				}, {
					type: 'context',
					elements: [{
						type: 'plain_text',
						text: body,
					}]
				}, {
					type: 'actions',
					elements: [{
						type: 'button',
						text: {
							type: 'plain_text',
							text: `Reply to <${email}>`,
						},
						url: `mailto:${email}`,
						action_id: 'email'
					}]
				}]
			};
			const resp = await fetch(process.env.SLACK_WEBHOOK, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(message),
			});

			if (resp.ok) {
				return {
					statusCode: 204,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'TK': 'N',
					}
				};
			} else {
				resp.text().then(console.error);
				throw new HTTPError('Error sending message', 502);
			}
		} else if (event.httpMethod === 'OPTIONS') {
			return {
				statusCode: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Options': 'POST, OPTIONS',
				}
			};
		} else {
			throw new HTTPError(`Unsupported HTTP Method: ${event.httpMethod}`, 405);
		}
	} catch(err) {
		if (err instanceof HTTPError) {
			return err.response;
		} else {
			console.error(err);
			return {
				statusCode: 500,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					error: {
						message: 'An unknown error occured',
						status: 500
					}
				})
			};
		}
	}
};
