/* eslint-env node */

function getRequestUrl({ path, multiValueQueryStringParameters = {}}, parseParams = true) {
	const { URL } = require('url');
	const url = new URL(path, process.env.BASE_URL || 'http://localhost:8888');

	if (parseParams === true) {
		Object.entries(multiValueQueryStringParameters).forEach(([key, values]) => {
			values.forEach(value => url.searchParams.append(key, value));
		});
	}
	return url;
}

class HTTPError extends Error {
	constructor(message, status = 500) {
		super(message);

		if (! Number.isInteger(status) || status < 100 || status > 600) {
			throw new HTTPError('Invalid HTTP Status Code', 500);
		} else {
			this.status = status;
		}
	}

	get body() {
		return {
			error: {
				status: this.status,
				message: this.message,
			}
		};
	}

	get headers() {
		switch(this.status) {
			case 405:
				return {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Options': 'GET, OPTIONS',
				};

			default:
				return {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				};
		}
	}

	get response() {
		return {
			statusCode: this.status,
			headers: this.headers,
			body: JSON.stringify(this),
		};
	}

	toJSON() {
		return this.body;
	}

	toString() {
		return JSON.stringify(this);
	}

	static createResponse(message, status) {
		try {
			const err = new HTTPError(message, status);
			return err.response;
		} catch(err) {
			if (err instanceof HTTPError) {
				return err.response;
			} else {
				return new HTTPError('An unknown error occured', 500);
			}
		}
	}
}

exports.handler = async function(event) {
	try {
		if (event.httpMethod === 'GET') {
			if (typeof process.env.SLACK_WEBHOOK !== 'string') {
				throw new HTTPError('Not configured', 501);
			}

			const url = getRequestUrl(event);

			// @TODO validate email address
			if (! url.searchParams.has('subject')) {
				throw new HTTPError('No subject given', 400);
			} else if (! url.searchParams.has('body')) {
				throw new HTTPError('No body given', 400);
			} else if (! url.searchParams.has('name')) {
				throw new HTTPError('No name given', 400);
			} else if (! url.searchParams.has('email')) {
				throw new HTTPError('No email address given', 400);
			} else if (! url.searchParams.has('origin')) {
				throw new HTTPError('Missing origin of message', 400);
			}

			const fetch = require('node-fetch');
			const message = {
				channel: '#message',
				text: `New Messsage on ${url.searchParams.get('origin')}`,
				blocks: [{
					type: 'header',
					text: {
						type: 'plain_text',
						text:`New Message from ${url.searchParams.get('name')}`
					}
				}, {
					type: 'section',
					fields: [{
						type: 'plain_text',
						text: `Email: ${url.searchParams.get('email')}`
					},{
						type: 'plain_text',
						text: `Phone: ${url.searchParams.get('phone') || 'Not given'}`
					}, {
						type: 'plain_text',
						text: `Subject: ${url.searchParams.get('subject')}`,
					}, {
						type: 'plain_text',
						text: `Site: ${url.searchParams.get('origin')}`,
					}, {
						type: 'plain_text',
						text: url.searchParams.get('body'),
					}],
					accessory: {
						type: 'button',
						text: {
							type: 'plain_text',
							text: `Reply to ${url.searchParams.get('name')} <${url.searchParams.get('email')}>`,
						},
						url: `mailto:${url.searchParams.get('email')}`,
						action_id: 'reply'
					}
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
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Options': 'GET, OPTIONS',
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
