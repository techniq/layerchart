import cloudflareAdapter from '@sveltejs/adapter-cloudflare';
import sveltePreprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import { codePreview } from 'svelte-ux/plugins/svelte.js';

import mdsvexConfig from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  preprocess: [mdsvex(mdsvexConfig), sveltePreprocess(), codePreview()],

  kit: {
    adapter: cloudflareAdapter(),
  },
};

export default config;
