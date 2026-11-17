import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: [vitePreprocess()],
      compilerOptions: {
        // `layerchart` is linked from the workspace, so its compiled components are checked too
        warningFilter: (warning) => !warning.filename?.includes('layerchart/dist/'),
      },
      adapter: adapter(),
    }),
  ],
  test: {
    projects: [
      {
        extends: true,
        // Discovered mid-run otherwise, which reloads the server and fails the test file's import
        optimizeDeps: {
          include: [
            'three',
            'three/addons/controls/OrbitControls.js',
            'three/addons/lines/Line2.js',
            'three/addons/lines/LineGeometry.js',
            'three/addons/lines/LineMaterial.js',
            '@threlte/core',
            'd3-scale',
            // `layerchart` is linked from the workspace rather than pre-bundled, so its own
            // dependencies are found as its modules load
            'layerchart > @dagrejs/dagre',
            'layerchart > @layerstack/svelte-actions/portal',
            'layerchart > @layerstack/svelte-state',
            'layerchart > @layerstack/tailwind',
            'layerchart > @layerstack/utils',
            'layerchart > @layerstack/utils/date',
            'layerchart > @layerstack/utils/object',
            'layerchart > d3-array',
            'layerchart > d3-color',
            'layerchart > d3-contour',
            'layerchart > d3-delaunay',
            'layerchart > d3-dsv',
            'layerchart > d3-geo-voronoi',
            'layerchart > d3-geo',
            'layerchart > d3-hierarchy',
            'layerchart > d3-interpolate-path',
            'layerchart > d3-interpolate',
            'layerchart > d3-path',
            'layerchart > d3-polygon',
            'layerchart > d3-quadtree',
            'layerchart > d3-scale-chromatic',
            'layerchart > d3-shape',
            'layerchart > d3-time',
            'layerchart > memoize',
            'layerchart > runed',
          ],
        },
        test: {
          name: 'client',
          testTimeout: 20000,
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
          },
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        },
      },
    ],
  },
});
