import { defineConfig } from 'mdsx';

import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMDC from 'remark-mdc';
import rehypePrettyCode from 'rehype-pretty-code';

import { visit } from 'unist-util-visit';

import {
	prettyCodeOptions,
	rehypeCodeBlocks,
	remarkLiveCode,
	remarkComponents
} from './src/lib/markdown/config/index.js';

/** Strip leading/trailing dashes from heading IDs produced by rehype-slug (using `:icon{}` directives, etc) */
function rehypeCleanSlugIds() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (/^h[1-6]$/.test(node.tagName) && node.properties?.id) {
				node.properties.id = node.properties.id.replace(/^-+|-+$/g, '');
			}
		});
	};
}

export const mdsxConfig = defineConfig({
	extensions: ['.md'],
	remarkPlugins: [
		remarkGfm,
		remarkMDC, // Parse MDC syntax (::component, :::component)
		remarkComponents, // Transform MDC components to Svelte components
		remarkLiveCode
	],
	rehypePlugins: [
		rehypeSlug,
		rehypeCleanSlugIds,
		// rehypeComponentExample,
		[rehypePrettyCode, prettyCodeOptions],
		rehypeCodeBlocks
	],
	blueprints: {
		default: {
			path: 'src/lib/markdown/blueprints/default/blueprint.svelte'
		}
	}
});
