/* eslint-env node */
import { HTTPError } from './http-error';
import { status } from './http-status';
import {
	SlackMessage, SlackSectionBlock, SlackPlainTextElement, SlackMarkdownElement,
	SlackButtonElement, SlackHeaderBlock, SlackDividerBlock, SlackContextBlock,
	SlackActionsBlock, SLACK_DEFAULT, SLACK_PRIMARY, SLACK_DANGER,
} from '@shgysk8zer0/slack';

import {
	isEmail, isString, isUrl, isTel, validateMessageHeaders, formatPhoneNumber,
} from './validation.js';


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

const ALLOWED_DOMAIN_SUFFIXES = [
	'--youthful-ptolemy-382377.netlify.app',
	'--youthful-ptolemy-382377.netlify.live',
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
	const origin = new URL(url).origin;
	return ALLOWED_ORIGINS.includes(origin)
		|| ALLOWED_DOMAIN_SUFFIXES.some(suff => origin.endsWith(suff));
}

export async function handler(event) {
	try {
		if (event.httpMethod === 'POST') {
			if (typeof process.env.SLACK_WEBHOOK !== 'string') {
				throw new HTTPError('Not configured', status.NOT_IMPLEMENTED);
			}

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

			const nowId = Date.now().toString(34);
			const actions = new SlackActionsBlock({
				elements: [
					new SlackButtonElement(new SlackPlainTextElement(`Reply to <${email}>`), {
						url: `mailto:${email}`,
						action: `email-${nowId}`,
						style: SLACK_PRIMARY,
					}),
					new SlackButtonElement(new SlackPlainTextElement(`Open site <${new URL(origin).hostname}>`), {
						url: origin,
						action: `origin-${nowId}`,
						style: SLACK_DEFAULT,
					}),
				]
			});

			if (isUrl(url)) {
				actions.add(
					new SlackButtonElement(new SlackPlainTextElement(`Open <${new URL(url).hostname}>`),  {
						url: url,
						action: `link-${nowId}`,
						style: SLACK_DANGER,
					})
				);
			}

			const message = new SlackMessage(process.env.SLACK_WEBHOOK,
				new SlackHeaderBlock(new SlackPlainTextElement(`New message on ${origin}`)),
				new SlackSectionBlock(new SlackPlainTextElement(`Subject: ${subject}`), {
					fields: [
						new SlackMarkdownElement(`*From*: ${name}`),
						new SlackMarkdownElement(`*Phone*: ${isTel(phone) ? formatPhoneNumber(phone) : 'Not given'}`
						),
					],
				}),
				new SlackDividerBlock(),
				new SlackContextBlock({ elements: [new SlackPlainTextElement(body)] }),
				actions,
			);

			return await message.send().then(() => ({
				statusCode: status.NO_CONTENT,
				headers: {
					'Access-Control-Allow-Origin': event.headers.origin,
					'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
				},
				body: '',
			})).catch(async err => {
				console.error(err);

				if (err.status !== 0) {
					await err.openInBlockKitBuilder();
				}

				throw new HTTPError('Error sending message', status.BAD_GATEWAY);
			});
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
		console.error(err);
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
}
