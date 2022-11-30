import { sveltekit } from '@sveltejs/kit/vite';
import sveld from 'vite-plugin-sveld';
import dsv from '@rollup/plugin-dsv';
import { autoType } from 'd3-dsv';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), sveld(), dsv({ processRow: autoType })],
	optimizeDeps: {
		exclude: ['svelte-ux']
	}
};

export default config;
