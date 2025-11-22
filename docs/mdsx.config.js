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

/**
 * @type {import('rehype-pretty-code').Options}
 */
const prettyCodeOptions = {
	theme: {
		light: 'github-light',
		dark: 'github-dark'
	},
	keepBackground: false,
	defaultLang: {
		block: 'plaintext'
		// inline: "plaintext",
	}
};

export const mdsxConfig = defineConfig({
	extensions: ['.md'],
	remarkPlugins: [remarkGfm],
	rehypePlugins: [
		rehypeSlug,
		// rehypeComponentExample,
		[rehypePrettyCode, prettyCodeOptions],
		rehypeAddCodeBlockClasses
	],
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

/**
 * Adds custom classes and data attributes to code blocks based on meta string
 * Supports syntax like ```js frame title="My Code" showLineNumbers
 */
function rehypeAddCodeBlockClasses() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'pre') {
				node.properties.className = node.properties.className || [];

				// Check if the code element has a data-meta attribute from rehype-pretty-code
				const codeNode = node.children?.find((child) => child.tagName === 'code');
				const meta = codeNode?.data?.meta || codeNode?.properties?.metastring;

				if (meta) {
					// Check for 'frame' keyword
					if (meta.includes('frame')) {
						node.properties['data-frame'] = '';
					}

					// Extract title="..." if present
					const titleMatch = meta.match(/title="([^"]+)"/);
					if (titleMatch) {
						node.properties['data-title'] = titleMatch[1];
					}

					// Check for line numbers flag in meta
					if (meta.includes('showLineNumbers') || meta.includes('ln')) {
						node.properties['data-line-numbers'] = '';
					}
				}

				// Check recursively for [data-line] attribute in nested children
				function hasDataLine(element) {
					if (element.properties?.['data-line'] !== undefined) {
						return true;
					}
					if (element.children) {
						return element.children.some((child) => hasDataLine(child));
					}
					return false;
				}

				if (codeNode && hasDataLine(codeNode)) {
					node.properties['data-line-numbers'] = '';
				}

				// Extract language from code element
				const codeClassName = codeNode?.properties?.className;
				if (Array.isArray(codeClassName)) {
					const langClass = codeClassName.find((cls) => cls.startsWith('language-'));
					if (langClass) {
						const language = langClass.replace('language-', '');
						node.properties['data-language'] = language;
					}
				}
			}
		});
	};
}
