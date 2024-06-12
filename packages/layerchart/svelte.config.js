import adapter from '@sveltejs/adapter-auto';
import sveltePreprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import { codePreview } from 'svelte-ux/plugins/svelte.js';

import mdsvexConfig from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  preprocess: [mdsvex(mdsvexConfig), sveltePreprocess(), codePreview()],

  kit: {
    adapter: adapter(),
    alias: {
      layerchart: 'src/lib/index.js',
      'layerchart/*': 'src/lib/*',
    },
  },
};

export default config;
