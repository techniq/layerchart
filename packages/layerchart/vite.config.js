import { sveltekit } from '@sveltejs/kit/vite';
import { sveld } from 'svelte-ux/plugins/vite.js';
import dsv from '@rollup/plugin-dsv';
import { autoType } from 'd3-dsv';

/** @type {import('vite').UserConfig} */
const config = {
  // @ts-expect-error
  plugins: [sveltekit(), sveld(), dsv({ processRow: autoType })],
  // optimizeDeps: {
  //   include: ['svelte-ux'],
  // },
};

export default config;
