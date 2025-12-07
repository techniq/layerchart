import templatePageSvelte from './template-page.svelte?raw';
import templateDataTs from './template-data.ts?raw';

export const templateProjectFiles = {
	'package.json': {
		file: {
			contents: JSON.stringify(
				{
					name: 'webcontainer-app',
					type: 'module',
					scripts: {
						dev: 'vite dev',
						build: 'vite build',
						preview: 'vite preview'
					},
					devDependencies: {
						tailwindcss: '^4.1.17',
						'@layerstack/tailwind': '2.0.0-next.19',
						'@layerstack/utils': '2.0.0-next.16',
						'@sveltejs/kit': '^2.49.1',
						'@sveltejs/vite-plugin-svelte': '^6.2.1',
						'@tailwindcss/vite': '^4.1.17',
						'@types/d3-array': '^3.2.2',
						'@types/d3-color': '^3.1.3',
						'@types/d3-dsv': '^3.0.7',
						'@types/d3-force': '^3.0.10',
						'@types/d3-geo': '^3.1.0',
						'@types/d3-hierarchy': '^3.1.7',
						'@types/d3-interpolate': '^3.0.4',
						'@types/d3-random': '^3.0.3',
						'@types/d3-sankey': '^0.12.5',
						'@types/d3-scale': '^4.0.9',
						'@types/d3-scale-chromatic': '^3.1.0',
						'@types/d3-shape': '^3.1.7',
						'@types/d3-time': '^3.0.4',
						'd3-array': '^3.2.4',
						'd3-color': '^3.1.0',
						'd3-dsv': '^3.0.1',
						'd3-force': '^3.0.0',
						'd3-geo': '^3.1.1',
						'd3-hierarchy': '^3.1.2',
						'd3-interpolate': '^3.0.1',
						'd3-random': '^3.0.1',
						'd3-sankey': '^0.12.3',
						'd3-scale': '^4.0.2',
						'd3-scale-chromatic': '^3.1.0',
						'd3-shape': '^3.2.0',
						'd3-time': '^3.1.0',
						runed: '^0.37.0',
						svelte: '5.45.5',
						'svelte-check': '^4.3.4',
						'svelte-ux': '2.0.0-next.20',
						tsx: '^4.21.0',
						typescript: '^5.9.3'
					},
					dependencies: {
						vite: '^7.2.6',
						layerchart: 'latest',
						'@sveltejs/adapter-auto': '^3.0.0'
					}
				},
				null,
				2
			)
		}
	},
	'vite.config.js': {
		file: {
			contents: `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()]
});`
		}
	},
	'svelte.config.js': {
		file: {
			contents: `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};

export default config;`
		}
	},
	'src/app.d.ts': {
		file: {
			contents: `// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};`
		}
	},
	'src/app.html': {
		file: {
			contents: `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>`
		}
	},
	'src/routes/+page.svelte': {
		file: {
			contents: templatePageSvelte
		}
	},
	'src/lib/data.ts': {
		file: {
			contents: templateDataTs
		}
	},
	'app.css': {
		file: {
			contents: `/* Basic app styles */`
		}
	}
};
