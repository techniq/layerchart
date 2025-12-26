import { defineConfig } from 'mdsx';

import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypePrettyCode from 'rehype-pretty-code';

import {
	prettyCodeOptions,
	rehypeCodeBlockTitle,
	rehypeHandleCodeBlocks,
	remarkLiveCode,
	remarkDirectives
} from './src/lib/markdown/config/index.js';

export const mdsxConfig = defineConfig({
	extensions: ['.md'],
	remarkPlugins: [
		remarkGfm,
		remarkDirective, // Parse directive syntax (:::directive)
		remarkDirectives, // Transform directives to components
		remarkLiveCode
	],
	rehypePlugins: [
		rehypeSlug,
		// rehypeComponentExample,
		[rehypePrettyCode, prettyCodeOptions],
		rehypeCodeBlockTitle,
		rehypeHandleCodeBlocks
	],
	blueprints: {
		default: {
			path: 'src/lib/markdown/blueprints/default/blueprint.svelte'
		}
	}
});
