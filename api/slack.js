/* eslint-env node */
const { HTTPError } = require('./http-error');
const { status } =  require('./http-status');

const ALLOWED_ORIGINS = [
	'https://kernvalley.us',
	'https://contact.kernvalley.us',
	'https://guide.kernvalley.us',
	'https://maps.kernvalley.us',
	'https://events.kernvalley.us',
	'https://news.kernvalley.us',
	'https://cdn.kernvalley.us',
	'https://ads.kernvalley.us',
	'https://camping.kernvalley.us',
	'https://whiskeyflatdays.com',
];

const ALLOW_METHODS = ['POST', 'OPTIONS'];

const ALLOWED_HEADERS = [
	'Content-Type', 'X-MESSAGE-ID', 'X-MESSAGE-TIME', 'X-MESSAGE-ORIGIN',
	'X-MESSAGE-SIG', 'X-MESSAGE-ALGO',
];

if (typeof process.env.BASE_URL === 'string') {
	ALLOWED_ORIGINS.push(new URL(process.env.BASE_URL).origin);
}

function allowedOrigin(url) {
	return ALLOWED_ORIGINS.includes(new URL(url).origin);
}

exports.handler = async function(event) {
	try {
		if (event.httpMethod === 'POST') {
			if (typeof process.env.SLACK_WEBHOOK !== 'string') {
				throw new HTTPError('Not configured', status.NOT_IMPLEMENTED);
			}

			const { isEmail, isString, isUrl, isTel, validateMessageHeaders,
				formatPhoneNumber } = require('./validation');

			const { subject, body, email, name, phone, origin, check, url } = JSON.parse(event.body);

			if (isString(check, { minLength: 0 })) {
				throw new HTTPError('Invalid data submitted', status.BAD_REQUEST);
			} else if (! validateMessageHeaders(event)) {
				throw new HTTPError('Invalid or missing signature', status.BAD_REQUEST);
			} else if (! isString(subject, { minLength: 4 })) {
				throw new HTTPError('No subject given', status.BAD_REQUEST);
			} else if (! isString(body, { minLength: 1 })) {
				throw new HTTPError('No body given', status.BAD_REQUEST);
			} else if (! isString(name, 4)) {
				throw new HTTPError('No name given', status.BAD_REQUEST);
			} else if (! isEmail(email)) {
				throw new HTTPError('No email address given or email is invalid', status.BAD_REQUEST);
			} else if (! isUrl(origin)) {
				throw new HTTPError('Missing or invalid origin for message', status.BAD_REQUEST);
			} else if (! allowedOrigin(origin) || ! allowedOrigin(event.headers.origin)) {
				throw new HTTPError('Not allowed', status.BAD_REQUEST);
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
					statusCode: status.NO_CONTENT,
					headers: {
						'Access-Control-Allow-Origin': event.headers.origin,
						'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
					}
				};
			} else {
				resp.text().then(console.error);
				throw new HTTPError('Error sending message', status.BAD_GATEWAY);
			}
		} else if (event.httpMethod === 'OPTIONS') {
			if (! ('origin' in event.headers)) {
				return { statusCode: status.BAD_REQUEST };
			} else if (! allowedOrigin(event.headers.origin)) {
				return { statusCode: status.BAD_REQUEST };
			} else {
				return {
					statusCode: status.NO_CONTENT,
					headers: {
						'Access-Control-Allow-Origin': event.headers.origin,
						'Access-Control-Allow-Methods': ALLOW_METHODS.join(', '),
						'Options': ALLOW_METHODS.join(', '),
						'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
					}
				};
			}
		} else {
			throw new HTTPError(`Unsupported HTTP Method: ${event.httpMethod}`, status.METHOD_NOT_ALLOWED);
		}
	} catch(err) {
		if (typeof err === 'object' && err instanceof HTTPError) {
			return err.response;
		} else {
			return {
				statusCode: status.INTERNAL_SERVER_ERROR,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
				},
				body: JSON.stringify({
					error: {
						message: err.message,
						status: status.INTERNAL_SERVER_ERROR,
					}
				})
			};
		}
	}
};
