/* eslint-env node*/

exports.postData = async function postData(event) {
	return { fields: JSON.parse(event.body) };
};
