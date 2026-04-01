import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';

/** @type {import('vite').UserConfig} */
const config = defineConfig({
  // Pre-bundle these dependencies to prevent Vite reload during tests
  // which causes "Failed to fetch dynamically imported module" errors
  // Ref: https://github.com/vitest-dev/vitest/issues/5477
  optimizeDeps: {
    include: [
      '@layerstack/tailwind',
      '@layerstack/utils',
      '@layerstack/svelte-state',
      '@layerstack/utils/object',
      'd3-array',
      'd3-color',
      'd3-delaunay',
      'd3-geo',
      'd3-geo-voronoi',
      'd3-interpolate-path',
      'd3-path',
      'd3-scale',
      'd3-shape',
      'd3-quadtree',
      'memoize',
      'runed',
    ],
  },
  plugins: [sveltekit()],
  ssr: {
    noExternal: true, // https://github.com/AdrianGonz97/refined-cf-pages-action/issues/26#issuecomment-2878397440
    // @dagrejs/dagre is CJS-only; pre-bundle for SSR to convert to ESM
    optimizeDeps: {
      include: ['@dagrejs/dagre'],
    },
  },
  test: {
    projects: [
      {
        // Client-side tests (Svelte components)
        extends: true,
        test: {
          name: 'client',
          testTimeout: 5000,
          retry: 1,
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: 'chromium' },
              // { browser: 'firefox' },
              // { browser: 'webkit' },
            ],
            headless: true,
          },
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**', 'src/**/*.ssr.{test,spec}.{js,ts}'],
          setupFiles: ['./src/vitest-setup-client.ts'],
        },
      },
      {
        // SSR tests (Server-side rendering)
        extends: true,
        test: {
          name: 'ssr',
          environment: 'node',
          include: ['src/**/*.ssr.{test,spec}.{js,ts}'],
        },
      },
      {
        // Server-side tests (Node.js utilities)
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/**/*.ssr.{test,spec}.{js,ts}'],
        },
      },
      {
        // Benchmarks (browser-based Svelte component benchmarks)
        extends: true,
        test: {
          name: 'bench',
          testTimeout: 30000,
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
          },
          include: ['src/**/*.svelte.bench.{js,ts}'],
          setupFiles: ['./src/vitest-setup-client.ts'],
          benchmark: {
            include: ['src/**/*.svelte.bench.{js,ts}'],
          },
        },
      },
    ],
    coverage: {
      include: ['src'],
      // Improved performance: Vitest only checks files in src/
      // instead of scanning the entire project
    },
  },
});

export default config;
