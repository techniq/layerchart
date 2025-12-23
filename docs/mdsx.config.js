import { defineConfig } from 'mdsx';

import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

import {
	prettyCodeOptions,
	rehypeCodeBlockTitle,
	rehypeHandleCodeBlocks
} from './src/lib/markdown/config/index.js';

export const mdsxConfig = defineConfig({
	extensions: ['.md'],
	remarkPlugins: [remarkGfm],
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
