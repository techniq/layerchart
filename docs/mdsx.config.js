import { defineConfig } from 'mdsx';

import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

import { readFileSync } from 'node:fs';
import path, { resolve } from 'node:path';
import process from 'node:process';
// import { fileURLToPath } from "node:url";
// import prettier from "@prettier/sync";
// import { getHighlighter } from 'shiki';
// import { createHighlighter } from 'shiki';
import { u } from 'unist-builder';
import { visit } from 'unist-util-visit';
// import { codeBlockPrettierConfig } from "./other/code-block-prettier.js";
// import { rehypeCustomHighlight } from '@mdsx/rehype-custom-highlighter';

export const mdsxConfig = defineConfig({
	extensions: ['.md'],
	remarkPlugins: [remarkGfm],
	rehypePlugins: [rehypeSlug, rehypeComponentExample, rehypePrettyCode],
	blueprints: {
		default: {
			path: 'src/lib/markdown/blueprints/default/blueprint.svelte'
		}
	}
});

/**
 * Adds the source code to component examples.
 *
 * @returns {HastTransformer} - unified transformer
 */
function rehypeComponentExample() {
	return async (tree) => {
		const componentRegex = /component="([^"]+)"/;
		const nameRegex = /name="([^"]+)"/;

		visit(tree, (node, index, parent) => {
			if (node?.type === 'raw' && node?.value?.startsWith('<SourceExample')) {
				const currNode = node;

				const componentMatch = currNode.value.match(componentRegex);
				const component = componentMatch ? componentMatch[1] : null;
				if (!component) return null;

				const nameMatch = currNode.value.match(nameRegex);
				const name = nameMatch ? nameMatch[1] : null;
				if (!name) return null;

				try {
					const sourceCode = getComponentSourceFileContent(component, name);
					if (!sourceCode)
						throw new Error(
							`Could not find source code for component: ${component} example: ${name}`
						);

					const sourceCodeNode = u('element', {
						tagName: 'pre',
						properties: {
							className: ['code']
						},
						children: [
							u('element', {
								tagName: 'code',
								properties: {
									className: [`language-svelte`]
								},
								attributes: {},
								children: [
									{
										type: 'text',
										value: sourceCode
									}
								]
							})
						]
					});
					if (!index) return;
					parent.children.splice(index + 1, 0, sourceCodeNode);
				} catch (e) {
					console.error(e);
				}
			}
		});
	};
}

function getComponentSourceFileContent(component, name) {
	if (!component || !name) return null;

	const filePath = path.join(process.cwd(), `./src/examples/${component}/${name}.svelte`);
	try {
		const fileContents = readFileSync(filePath, 'utf-8');

		// return prettier.format(
		// 	transformComponentSourceContent(fileContents),
		// 	codeBlockPrettierConfig
		// );
		return fileContents;
	} catch (e) {
		console.error(`Error reading file at ${filePath}:`, e);
		return null;
	}
}

// function transformComponentSourceContent(src = '') {
// 	// return src.replaceAll(`import { cn } from "$lib/utils/styles.js"`, `import cn from "clsx"`);
// 	return src;
// }
