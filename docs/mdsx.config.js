import { defineConfig } from 'mdsx';

import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMDC from 'remark-mdc';
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
		remarkMDC, // Parse MDC syntax (::component, :::component)
		remarkDirectives, // Transform MDC components to Svelte components
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
