import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsx } from 'mdsx';
import { mdsxConfig } from './mdsx.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [mdsx(mdsxConfig), vitePreprocess()],
	extensions: ['.svelte', '.md'],
	kit: {
		adapter: adapter(),
		alias: {
			$examples: './src/examples',
			'$static/*': 'static/*',
			'content-collections': './.content-collections/generated'
		},
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		},
		warningFilter: (warning) => {
			// Suppress state_referenced_locally warnings
			if (
				warning.code === 'state_referenced_locally' &&
				warning.filename?.includes('/packages/layerchart')
			) {
				return false;
			}
			return true;
		}
	},
	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'alt-shift',
			toggleButtonPos: 'bottom-right'
		}
	}
};

export default config;
