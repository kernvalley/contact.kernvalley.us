/* eslint-env node */
import { getConfig } from '@shgysk8zer0/js-utils/rollup';
import { rollupImport, rollupImportMeta } from '@shgysk8zer0/rollup-import';

export default getConfig('./js/index.js', {
	plugins: [
		rollupImport('./importmap.json'),
		rollupImportMeta({ baseURL: 'https://contact.kernvalley.us/' }),
	],
	format: 'iife',
	minify: true,
	sourcemap: true,
});
