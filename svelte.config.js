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
		adapter: vercelAdapter()
	}
};

export default config;
