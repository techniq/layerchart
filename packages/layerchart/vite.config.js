import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
// import { sveld } from 'svelte-ux/plugins/vite.js';
import dsv from '@rollup/plugin-dsv';
import { autoType } from 'd3-dsv';
import Icons from 'unplugin-icons/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    tailwindcss(),
    sveltekit(),
    // /*sveld(),*/
    // @ts-expect-error
    dsv({ processRow: autoType }),
    Icons({
      compiler: 'svelte',
    }),
  ],
  // optimizeDeps: {
  //   include: ['svelte-ux'],
  // },
};

export default config;
