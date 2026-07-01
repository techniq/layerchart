import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess()],
  compilerOptions: {
    warningFilter: (warning) => {
      // Ignore "state_referenced_locally" warnings
      // These occur when capturing initial prop values which is intentional
      // TODO: re-enable and handle each case properly
      if (warning.code === 'state_referenced_locally') return false;
      return true;
    },
  },

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
