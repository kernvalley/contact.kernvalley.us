/* eslint-env node */
const { HTTPError } = require('./http-error');

const ALLOWED_ORIGINS = [
	'kernvalley.us',
	'whiskeyflatdays.com',
];

const ALLOWED_HEADERS = [
	'X-MESSAGE-ID', 'X-MESSAGE-TIME', 'X-MESSAGE-ORIGIN', 'X-MESSAGE-SIG', 'X-MESSAGE-ALGO',
];

if (typeof process.env.BASE_URL === 'string') {
	ALLOWED_ORIGINS.push(new URL(process.env.BASE_URL).hostname);
}

// function allowedOrigin(url) {
// 	const { hostname, protocol } = new URL(url);

// 	return protocol === 'https:' && (ALLOWED_ORIGINS.includes(hostname)
// 		|| hostname.endsWith('.kernvalley.us'));
// }

function allowedOrigin() {
	return true;
}

exports.handler = async function(event) {
	try {
		if (event.httpMethod === 'POST') {
			if (typeof process.env.SLACK_WEBHOOK !== 'string') {
				throw new HTTPError('Not configured', 501);
			}

			const { isEmail, isString, isUrl, isTel, validateMessageHeaders,
				formatPhoneNumber } = require('./validation');

			const { subject, body, email, name, phone, origin, check, url } = JSON.parse(event.body);

			if (isString(check, { minLength: 0 })) {
				throw new HTTPError('Invalid data submitted', 400);
			} else if (! validateMessageHeaders(event)) {
				throw new HTTPError('Invalid or missing signature', 400);
			} else if (! isString(subject, { minLength: 4 })) {
				throw new HTTPError('No subject given', 400);
			} else if (! isString(body, { minLength: 1 })) {
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
						text: `Origin: ${origin}`,
					}]
				}, {
					type: 'divider',
				}, {
					type: 'context',
					elements: [{
						type: 'mrkdwn',
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
						action_id: 'email',
					}]
				}]
			};

			if (isUrl(url)) {
				const actions = message.blocks.find(({ type }) => type === 'actions');
				actions.elements.push({
					type: 'button',
					text: {
						type: 'plain_text',
						text: `Open ${new URL(url).origin}`
					},
					url: url,
					action_id: 'page_url',
				});
			}

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
						'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
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
					'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
				}
			};
		} else {
			throw new HTTPError(`Unsupported HTTP Method: ${event.httpMethod}`, 405);
		}
	} catch(err) {
		console.error(err);
		if (err instanceof HTTPError) {
			return err.response;
		} else {
			console.error(err);
			return {
				statusCode: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
				},
				body: JSON.stringify({
					error: {
						message: err.message,
						status: 500
					}
				})
			};
		}
	}
};
