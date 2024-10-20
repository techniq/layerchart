import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { codePreview } from 'svelte-ux/plugins/svelte.js';

import mdsvexConfig from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  preprocess: [mdsvex(mdsvexConfig), vitePreprocess(), codePreview()],

  kit: {
    adapter: adapter(),
    alias: {
      layerchart: 'src/lib/index.js',
      'layerchart/*': 'src/lib/*',
      '$static/*': 'static/*',
    },
  },
};

export default config;
