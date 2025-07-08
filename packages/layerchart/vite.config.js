import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
// import { sveld } from 'svelte-ux/plugins/vite.js';
import dsv from '@rollup/plugin-dsv';
import { autoType } from 'd3-dsv';
import Icons from 'unplugin-icons/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { visualizer } from 'rollup-plugin-visualizer';

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
    // @ts-expect-error
    devtoolsJson(),
    // Needs to be last
    visualizer({
      emitFile: true,
      filename: 'stats.html',
      gzipSize: true,
    }),
  ],
  // optimizeDeps: {
  //   include: ['svelte-ux'],
  // },
  resolve: {
    noExternal: true, // https://github.com/AdrianGonz97/refined-cf-pages-action/issues/26#issuecomment-2878397440
  },
  optimizeDeps: {
    exclude: ['~icons'],
  },
};

export default config;
