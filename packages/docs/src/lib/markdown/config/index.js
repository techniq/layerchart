// @ts-nocheck
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { defineConfig } from 'mdsx';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMDC from 'remark-mdc';
import rehypePrettyCode from 'rehype-pretty-code';
import { visit } from 'unist-util-visit';

// Remark plugins
export { remarkLiveCode } from '../rehype/live-code.js';
export { remarkComponents } from '../remark/components.js';

// Rehype plugins
export { rehypeCodeBlocks } from '../rehype/handle-code-blocks.js';

// Transformers
export { shikiDiffTransformer } from '../transformers/shiki-diff.js';

// Configuration
export { prettyCodeOptions } from './pretty-code.js';

import { prettyCodeOptions } from './pretty-code.js';
import { rehypeCodeBlocks } from '../rehype/handle-code-blocks.js';
import { remarkLiveCode } from '../rehype/live-code.js';
import { remarkComponents } from '../remark/components.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Strip leading/trailing dashes from heading IDs produced by rehype-slug. */
export function rehypeCleanSlugIds() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (/^h[1-6]$/.test(node.tagName) && node.properties?.id) {
				node.properties.id = node.properties.id.replace(/^-+|-+$/g, '');
			}
		});
	};
}

export function getDefaultBlueprintPath() {
	return join(__dirname, '../blueprints/default/blueprint.svelte');
}

/**
 * Create the shared MDSX config used by LayerStack docs apps.
 *
 * @param {{
 *   markdownComponentsPath?: string;
 *   exampleComponentPath?: string;
 *   liveCodeComponent?: string;
 *   liveCodeOutputDir?: string;
 *   liveCodeImportPrefix?: string;
 *   blueprintPath?: string;
 * }} [options]
 */
export function createMdsxConfig(options = {}) {
	return defineConfig({
		extensions: ['.md'],
		remarkPlugins: [
			remarkGfm,
			remarkMDC,
			[
				remarkComponents,
				{
					markdownComponentsPath:
						options.markdownComponentsPath ?? '@layerstack/docs/markdown/components',
					exampleComponentPath: options.exampleComponentPath ?? '$lib/components'
				}
			],
			[
				remarkLiveCode,
				{
					outputDir: options.liveCodeOutputDir,
					importPrefix: options.liveCodeImportPrefix,
					liveCodeComponent:
						options.liveCodeComponent ??
						'@layerstack/docs/markdown/components/LiveCode.svelte'
				}
			]
		],
		rehypePlugins: [
			rehypeSlug,
			rehypeCleanSlugIds,
			[rehypePrettyCode, prettyCodeOptions],
			rehypeCodeBlocks
		],
		blueprints: {
			default: {
				path: options.blueprintPath ?? getDefaultBlueprintPath()
			}
		}
	});
}
