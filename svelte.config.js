import vercelAdapter from '@sveltejs/adapter-vercel';
import sveltePreprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import sveld from 'vite-plugin-sveld';
import { markdownToc } from 'svelte-ux/plugins/svelte';

import mdsvexConfig from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	preprocess: [mdsvex(mdsvexConfig), sveltePreprocess(), markdownToc()],

	kit: {
		adapter: vercelAdapter(),
		vite: {
			plugins: [sveld()],
			optimizeDeps: {
				// Fixes: `Missing "./package.json" export in "d3-scale" package`
				// include: ['d3-array', 'd3-format', 'd3-scale', 'd3-shape', 'd3-time']
			}
		}
	}
};

export default config;
