import staticAdapter from '@sveltejs/adapter-static';
import sveltePreprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';

import mdsvexConfig from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	preprocess: [mdsvex(mdsvexConfig), sveltePreprocess()],

	kit: {
		adapter: staticAdapter(),
		target: '#svelte',
		ssr: false, // TODO: Re-enable after identifing/fixing layout shift
		vite: {
			optimizeDeps: {
				// Fixes: `Missing "./package.json" export in "d3-scale" package`
				include: ['d3-array', 'd3-format', 'd3-scale', 'd3-shape', 'd3-time']
			}
		}
	}
};

export default config;
