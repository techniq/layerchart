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
		}
	},
	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'alt-shift',
			toggleButtonPos: 'bottom-right'
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
