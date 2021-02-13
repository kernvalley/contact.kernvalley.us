/* eslint-env node */
const { URL } = require('url');

const between = (val, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) => {
	if (typeof val === 'string') {
		return between(parseFloat(val), { min, max });
	} else if (typeof val !== 'number' || Number.isNaN(val)) {
		return false;
	} else if (val < min || val > max) {
		return false;
	} else {
		return true;
	}
};

const isDate = (str) => {
	try {
		return ! Number.isNaN(new Date(str).getTime());
	} catch(e) {
		return false;
	}
};

/* By default, false on empty strings */
const isString = (str, { minLength = 1, maxLength } = {}) => {
	if (typeof str !== 'string') {
		return false;
	} else {
		return between(str.length, { min: minLength, max: maxLength });
	}
};

const isEmail = (str) => isString(str, { minLength: 8 }) && str.includes('@')
	&& isUrl(`mailto:${str}`) && ! ['/',  '?', '#'].some(char => str.includes(char));

const isUrl = (str) => {
	try {
		return new URL(str).href.length !== 0;
	} catch(e) {
		return false;
	}
};

const isTel = (str) => isString(str, { minLength: 10 });

exports.isString = isString;
exports.isEmail = isEmail;
exports.isUrl = isUrl;
exports.isTel = isTel;
exports.between = between;
exports.validateMessageHeaders = ({ headers: {
	'x-message-id': uuid,
	'x-message-time': date,
	'x-message-origin': origin,
	'x-message-sig': signature,
	'x-message-algo': algo = 'sha256',
}} = {}) => {
	if (! isString(signature)) {
		return false;
	} else if (! isDate(date)) {
		return false;
	} else if (! isString(uuid, { minLength: 36, maxLength: 36 })) {
		return false;
	} else if (! isString(origin)) {
		return false;
	} else if (! isString(algo)) {
		return false;
	} else if (Math.abs(new Date(date).getTime() - new Date().getTime()) > 30000) {
		// Message is withing a 30 sec window of now
		return false;
	} else {
		try {
			const { createHash } = require('crypto');
			const hash = createHash(algo.toLowerCase())
				.update(JSON.stringify({ uuid, date, origin })).digest('hex');
			return hash === signature;
		} catch(e) {
			return false;
		}
	}
};
