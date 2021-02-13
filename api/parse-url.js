/* eslint-env node */

exports.getRequestUrl = function getRequestUrl({ path, multiValueQueryStringParameters = {}}, parseParams = true) {
	const { URL } = require('url');
	const url = new URL(path, process.env.BASE_URL || 'http://localhost:8888');

	if (parseParams === true) {
		Object.entries(multiValueQueryStringParameters).forEach(([key, values]) => {
			values.forEach(value => url.searchParams.append(key, value));
		});
	}
	return url;
};
